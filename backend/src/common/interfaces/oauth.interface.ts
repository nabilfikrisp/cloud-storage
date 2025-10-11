import { Provider } from "@prisma/client";

export interface OAuthUser {
  provider: Provider;
  providerId: string;
  name: string;
  email: string;
}
