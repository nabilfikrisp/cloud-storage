import { EnvService } from "@/modules/env/env.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";
import { AuthService } from "../auth.service";
import { Provider } from "@prisma/client";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    env: EnvService,
    private authService: AuthService,
  ) {
    super({
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: env.githubCallbackURL,
      scope: ["user:email"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    try {
      const { id, displayName, emails } = profile;

      const email = emails?.[0]?.value;
      if (!email) {
        console.error(
          "[GithubStrategy] Missing email in Github profile:",
          profile.id,
        );

        throw new UnauthorizedException(
          "Your Github account does not provide an email address. Please use a different sign-in method.",
        );
      }

      const user = this.authService.validateOAuthLogin({
        provider: Provider.GITHUB,
        providerId: id,
        name: displayName,
        email,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }
}
