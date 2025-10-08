import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SignUpDto } from "./dtos/sign-up.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    const payload = { sub: auth.user.id, username: auth.user.username };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, user: auth.user };
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

  async checkEmailIsTaken(email: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return existingUser ? true : false;
  }

  async getLocalAuth(email: string) {
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

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
