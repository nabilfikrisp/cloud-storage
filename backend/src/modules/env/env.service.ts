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
    const requiredKeys = [
      "JWT_SECRET",
      "DATABASE_URL",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_CALLBACK_URL",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_CALLBACK_URL",
    ];
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

  get jwtExpiresIn(): string {
    return this.config.get<string>("JWT_EXPIRES_IN", "30m");
  }

  get saltRounds(): number {
    return Number(this.config.get<string>("SALT_ROUNDS", "8"));
  }

  get databaseUrl(): string {
    return this.config.get<string>("DATABASE_URL")!;
  }

  get jwtSecret(): string {
    return this.config.get<string>("JWT_SECRET")!;
  }

  get googleClientId(): string {
    return this.config.get<string>("GOOGLE_CLIENT_ID")!;
  }

  get googleClientSecret(): string {
    return this.config.get<string>("GOOGLE_CLIENT_SECRET")!;
  }

  get googleCallbackURL(): string {
    return this.config.get<string>("GOOGLE_CALLBACK_URL")!;
  }

  get githubClientId(): string {
    return this.config.get<string>("GITHUB_CLIENT_ID")!;
  }

  get githubClientSecret(): string {
    return this.config.get<string>("GITHUB_CLIENT_SECRET")!;
  }

  get githubCallbackURL(): string {
    return this.config.get<string>("GITHUB_CALLBACK_URL")!;
  }
}
