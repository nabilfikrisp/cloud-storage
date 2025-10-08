import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EnvService {
  private readonly logger = new Logger(EnvService.name);

  constructor(private readonly config: ConfigService) {
    this.validateEnv();
  }

  // 👇 Manual validation logic
  private validateEnv() {
    const requiredKeys = ["JWT_SECRET", "DATABASE_URL"];
    for (const key of requiredKeys) {
      if (!this.config.get(key)) {
        this.logger.error(`Missing required environment variable: ${key}`);
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  get nodeEnv(): string {
    return this.config.get<string>("NODE_ENV", "development");
  }

  get port(): number {
    return Number(this.config.get<string>("PORT", "3001"));
  }

  get databaseUrl(): string {
    return this.config.get<string>("DATABASE_URL")!;
  }

  get jwtSecret(): string {
    return this.config.get<string>("JWT_SECRET")!;
  }

  get jwtExpiresIn(): string {
    return this.config.get<string>("JWT_EXPIRES_IN", "30m");
  }
}
