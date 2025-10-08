import type { AuthReq } from "@/common/interfaces/auth-req.interface";
import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMe(@Request() req: AuthReq) {
    const userId = req.user.sub;

    const user = await this.userService.getMe(userId);

    return { message: "Me endpoint", user };
  }

  @Get(":id")
  async getUser(@Param("id") id: string) {
    const user = await this.userService.getOne({ id });

    return { message: "User endpoint", user };
  }

  @Get()
  async getUsers() {
    const users = await this.userService.getAll();

    return { message: "Users endpoint", users };
  }
}
