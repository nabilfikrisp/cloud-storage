import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SignUpDto } from "./dtos/sign-up.dto";
import { AuthService } from "./auth.service";
import { SuccessResponse } from "@/common/responses/success-response.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("sign-up")
  @HttpCode(HttpStatus.CREATED)
  async postSignUp(@Body() signUpDto: SignUpDto) {
    try {
      const newUser = await this.authService.signUp(signUpDto);

      return new SuccessResponse({
        message: "User registered successfully",
        data: {
          newUser,
        },
        statusCode: HttpStatus.CREATED,
      });
    } catch (error) {
      throw error;
    }
  }
}
