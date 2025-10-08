import { AuthReq } from "@/common/interfaces/auth-req.interface";
import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { EnvService } from "../env/env.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: AuthReq = context.switchToHttp().getRequest();
    const jwtSecret = this.envService.jwtSecret;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("Missing authentication token");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtSecret,
      });
      request.user = payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    if (type !== "Bearer") {
      return undefined;
    }
    return token;
  }
}
