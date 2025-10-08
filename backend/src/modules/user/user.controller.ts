import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMe(
    @Request()
    req: Request & {
      user: { sub: string; username: string };
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.sub;

    console.log(req.user);

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
