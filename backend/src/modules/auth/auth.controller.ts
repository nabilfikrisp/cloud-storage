import { SuccessResponse } from "@/common/responses/success-response.dto";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { AuthGuard } from "@nestjs/passport";
import type { GoogleCallbackReq } from "@/common/interfaces/auth-req.interface";

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
      const { token, user } = await this.authService.signInLocal(signInDto);

      return new SuccessResponse({
        message: "User signed in successfully",
        data: {
          user,
          token,
        },
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get("google")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Guard redirects
  }

  @Get("google/callback")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: GoogleCallbackReq) {
    try {
      const user = req.user;
      const token = await this.authService.issueJwt(user);

      return new SuccessResponse({
        message: "Google OAuth successful",
        data: {
          user,
          token,
        },
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      throw error;
    }
  }
}
