import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get(":id")
  async getUser(@Param("id") id: string) {
    const user = await this.userService.user({ id });

    return { message: "User endpoint", user };
  }

  @Get()
  async getUsers() {
    const users = await this.userService.users();

    return { message: "Users endpoint", users };
  }
}
