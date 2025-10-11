import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { EnvService } from "@/modules/env/env.service";
import { AuthService } from "../auth.service";
import { Provider } from "@prisma/client";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    env: EnvService,
    private authService: AuthService,
  ) {
    super({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackURL,
      scope: ["email", "profile"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const { id, displayName, emails } = profile;

      const email = emails?.[0]?.value;
      if (!email) {
        console.error(
          "[GoogleStrategy] Missing email in Google profile:",
          profile.id,
        );

        return done(
          new UnauthorizedException(
            "Your Google account does not provide an email address. Please use a different sign-in method.",
          ),
          false,
        );
      }

      const user = this.authService.validateOAuthLogin({
        provider: Provider.GOOGLE,
        providerId: id,
        name: displayName,
        email,
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
