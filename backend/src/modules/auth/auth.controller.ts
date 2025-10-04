import { Body, Controller, Post } from "@nestjs/common";
import { SignUpDto } from "./dtos/sign-up.dto";

@Controller("auth")
export class AuthController {
  constructor() {}

  @Post("sign-up")
  postSignUp(@Body() signUpDto: SignUpDto) {
    return { message: "Sign up endpoint", data: signUpDto };
  }
}
