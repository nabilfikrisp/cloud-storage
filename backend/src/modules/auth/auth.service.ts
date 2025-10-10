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
    const { email, username } = signUpDto;

    const emailIsTaken = await this.checkEmailIsTaken(email);
    if (emailIsTaken) {
      throw new ConflictException("Email is already taken");
    }

    if (username) {
      const usernameIsTaken = await this.checkUsernameIsTaken(username);
      if (usernameIsTaken) {
        throw new ConflictException("Username is already taken");
      }
    }

    const newUser = await this.createUserAndAuth(signUpDto);

    const token = await this.issueJwt(newUser);

    return { token, user: newUser };
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

  async createUserAndAuth(dto: SignUpDto) {
    const username =
      dto.username ?? (await this.generateRandomUniqueUsername());

    const displayName = dto.displayName ?? username;

    const passwordHash = await this.hashPassword(dto.password);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          username,
          displayName,
        },
      });

      await tx.auth.create({
        data: {
          userId: newUser.id,
          passwordHash,
          provider: Provider.LOCAL,
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
      where: { provider: Provider.GOOGLE, providerId },
      include: { user: true },
    });
  }

  private async createUserAndAuthFromGoogle(user: UserFromGoogle) {
    const { email, name, providerId, provider } = user;

    const username = await this.displayNameToUsername(name);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username, displayName: name },
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

  private async checkUsernameIsTaken(username: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    return existingUser ? true : false;
  }

  private async generateRandomUniqueUsername(): Promise<string> {
    const adjectives = [
      "brave",
      "calm",
      "swift",
      "clever",
      "bright",
      "mellow",
      "wild",
      "bold",
      "quiet",
      "lucky",
    ];

    const nouns = [
      "lion",
      "falcon",
      "river",
      "forest",
      "storm",
      "phoenix",
      "panda",
      "mountain",
      "comet",
      "dream",
    ];

    for (let attempt = 0; attempt < 10; attempt++) {
      const adjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNumber = Math.floor(Math.random() * 10000);

      const username = `${adjective}_${noun}_${randomNumber}`;

      const existing = await this.checkUsernameIsTaken(username);

      if (!existing) {
        return username;
      }
    }

    // fallback if all attempts collide
    return `user_${Date.now()}`;
  }

  private async displayNameToUsername(displayName: string) {
    // Split display name into words
    const words = displayName.split(/\s+/).filter(Boolean);

    // Try first two words, fallback to first word if only one word
    let base = words.length > 1 ? `${words[0]}${words[1]}` : words[0];

    // Sanitize: remove non-alphanumeric and lowercase
    base = base.replace(/[^a-z0-9]/gi, "").toLowerCase();

    let username = base;
    let counter = 1;

    // Ensure uniqueness
    while (await this.checkUsernameIsTaken(username)) {
      username = `${base}${counter++}`;
    }

    return username;
  }

  private async getLocalAuth(email: string) {
    const auth = await this.prisma.auth.findFirst({
      where: {
        provider: Provider.LOCAL,
        providerId: email,
      },
      include: {
        user: true,
      },
    });

    return auth;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.env.saltRounds;
    return await bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
