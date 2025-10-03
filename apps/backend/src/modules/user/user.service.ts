import { Injectable } from "@nestjs/common";
import { Prisma, User } from "generated/prisma";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    return user;
  }

  async users(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users;
  }
}
