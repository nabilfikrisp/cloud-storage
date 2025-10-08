import { SuccessResponse } from "@/common/responses/success-response.dto";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dtos/sign-up.dto";
import { SignInDto } from "./dtos/sign-in.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("sign-up/local")
  @HttpCode(HttpStatus.CREATED)
  async postSignUp(@Body() signUpDto: SignUpDto) {
    try {
      const newUser = await this.authService.signUpLocal(signUpDto);

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

  @Post("sign-in/local")
  @HttpCode(HttpStatus.OK)
  async postSignIn(@Body() signInDto: SignInDto) {
    try {
      const { accessToken, user } =
        await this.authService.signInLocal(signInDto);

      return new SuccessResponse({
        message: "User signed in successfully",
        data: {
          user,
          accessToken,
        },
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      throw error;
    }
  }
}
