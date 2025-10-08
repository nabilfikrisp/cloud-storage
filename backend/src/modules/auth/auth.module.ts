import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { EnvModule } from "../env/env.module";
import { EnvService } from "../env/env.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        secret: env.jwtSecret,
        signOptions: { expiresIn: env.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
