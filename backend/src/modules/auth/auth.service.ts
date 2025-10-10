import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { UserFromGoogle } from "@/common/interfaces/google-profile.interface";
import { Provider, User } from "@prisma/client/wasm";
import { EnvService } from "../env/env.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private env: EnvService,
  ) {}

  async signUpLocal(signUpDto: SignUpDto) {
    const { email } = signUpDto;

    const emailIsTaken = await this.checkEmailIsTaken(email);
    if (emailIsTaken) {
      throw new ConflictException("Email is already taken"); // 409
    }

    const newUser = await this.createUserAndAuth(signUpDto);

    return newUser;
  }

  async signInLocal(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const auth = await this.getLocalAuth(email);

    if (!auth || !auth.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // to be implemented later
    // if (!auth.user.isVerified) {
    //   throw new ForbiddenException("Email not verified");
    // }

    const isValid = await this.validatePassword(password, auth.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.issueJwt(auth.user);

    return { token, user: auth.user };
  }

  async createUserAndAuth(signUpDto: SignUpDto) {
    const { email, username, password } = signUpDto;
    const passwordHash = await this.hashPassword(password);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
        },
      });

      await tx.auth.create({
        data: {
          userId: newUser.id,
          passwordHash,
          provider: "LOCAL",
          providerId: newUser.email,
        },
      });

      return newUser;
    });
  }

  async validateGoogleLogin(user: UserFromGoogle) {
    const { email, providerId, provider, name } = user;
    // Check if this Google account is already linked
    let auth = await this.findGoogleAuthByProviderId(providerId);
    if (auth) {
      return auth.user;
    }

    //  If email already used (local or another provider)
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      auth = await this.createAuthForExistingUser(
        existingUser,
        provider,
        providerId,
      );
      return auth.user;
    }

    //  New Google user — create both
    auth = await this.createUserAndAuthFromGoogle({
      email,
      name,
      providerId,
      provider,
    });
    return auth.user;
  }

  async issueJwt(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const secret = this.env.jwtSecret;
    const expiresIn = this.env.jwtExpiresIn;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
    return { accessToken, expiresIn };
  }

  private async findGoogleAuthByProviderId(providerId: string) {
    return await this.prisma.auth.findFirst({
      where: { provider: "GOOGLE", providerId },
      include: { user: true },
    });
  }

  private async createUserAndAuthFromGoogle(user: UserFromGoogle) {
    const { email, name, providerId, provider } = user;

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username: name },
      });

      const newAuth = await tx.auth.create({
        data: {
          userId: newUser.id,
          provider,
          providerId,
        },
        include: { user: true },
      });

      return newAuth;
    });
  }

  private async createAuthForExistingUser(
    user: User,
    provider: Provider,
    providerId: string,
  ) {
    return await this.prisma.auth.create({
      data: {
        userId: user.id,
        provider,
        providerId,
      },
      include: { user: true },
    });
  }

  private async checkEmailIsTaken(email: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return existingUser ? true : false;
  }

  private async getLocalAuth(email: string) {
    const auth = await this.prisma.auth.findFirst({
      where: {
        provider: "LOCAL",
        providerId: email,
      },
      include: {
        user: true,
      },
    });

    return auth;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
