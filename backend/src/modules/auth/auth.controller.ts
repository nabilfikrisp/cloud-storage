import { SuccessResponse } from "@/common/responses/success-response.dto";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { AuthGuard } from "@nestjs/passport";
import type {
  AuthReq,
  GoogleCallbackReq,
} from "@/common/interfaces/auth-req.interface";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("local/sign-up")
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

  @Post("local/sign-in")
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

  @Post("local/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async postVerify(@Request() req: AuthReq) {
    try {
      const userId = req.user.sub;
      const user = await this.authService.verifyUser(userId);

      return new SuccessResponse({
        message: "User verified successfully",
        data: {
          user,
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

  @Get("github")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("github"))
  async githubAuth() {
    // Guard redirects
  }

  @Get("github/callback")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("github"))
  async githubAuthRedirect(@Req() req: GoogleCallbackReq) {
    try {
      const user = req.user;
      const token = await this.authService.issueJwt(user);

      return new SuccessResponse({
        message: "Github OAuth successful",
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
