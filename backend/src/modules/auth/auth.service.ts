import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SignUpDto } from "./dtos/sign-up.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(signUpDto: SignUpDto) {
    const { email } = signUpDto;

    await this.ensureEmailIsNotTaken(email);

    return await this.createUserAndAuth(signUpDto);
  }

  async ensureEmailIsNotTaken(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException("Email is already in use");
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

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
