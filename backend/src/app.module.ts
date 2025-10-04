import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { UserModule } from "./modules/user/user.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [UserModule, PrismaModule, AuthModule, CommonModule],
  controllers: [AppController],
})
export class AppModule {}
