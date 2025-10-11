import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { OAuthUser } from "@/common/interfaces/oauth.interface";
import { Provider, User } from "@prisma/client/wasm";
import { EnvService } from "../env/env.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private env: EnvService,
  ) {}

  async signUpLocal(signUpDto: SignUpDto) {
    const { email, username } = signUpDto;

    const emailIsTaken = await this.checkEmailIsTaken(email);
    if (emailIsTaken) {
      throw new ConflictException("Email is already taken");
    }

    if (username) {
      const usernameIsTaken = await this.checkUsernameIsTaken(username);
      if (usernameIsTaken) {
        throw new ConflictException("Username is already taken");
      }
    }

    const newUser = await this.createUserAndAuth(signUpDto);

    const token = await this.issueJwt(newUser);

    return { token, user: newUser };
  }

  async signInLocal(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const auth = await this.getLocalAuth(email);

    if (!auth || !auth.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // to be implemented later
    // if (!auth.user.isVerified) {
    //   throw new ForbiddenException("Email not verified");
    // }

    const isValid = await this.validatePassword(password, auth.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.issueJwt(auth.user);

    return { token, user: auth.user };
  }

  async createUserAndAuth(dto: SignUpDto) {
    const username = dto.username ?? (await this.generateRandomUsername());

    const displayName = dto.displayName ?? username;

    const passwordHash = await this.hashPassword(dto.password);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          username,
          displayName,
        },
      });

      await tx.auth.create({
        data: {
          userId: newUser.id,
          passwordHash,
          provider: Provider.LOCAL,
          providerId: newUser.email,
        },
      });

      return newUser;
    });
  }

  async issueJwt(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const secret = this.env.jwtSecret;
    const expiresIn = this.env.jwtExpiresIn;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
    return { accessToken, expiresIn };
  }

  // OAuth functions
  async validateOAuthLogin(user: OAuthUser) {
    const { email, providerId, provider, name } = user;

    const existingAuth = await this.findOauthAuthByProviderId(
      provider,
      providerId,
    );

    if (existingAuth) {
      return existingAuth.user;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      const newAuth = await this.createAuthForExistingUser(
        existingUser,
        provider,
        providerId,
      );
      return newAuth.user;
    }

    const newAuth = await this.createUserAndAuthFromOauth({
      email,
      name,
      providerId,
      provider,
    });
    return newAuth.user;
  }

  private async findOauthAuthByProviderId(
    provider: Provider,
    providerId: string,
  ) {
    return await this.prisma.auth.findFirst({
      where: { provider: provider, providerId },
      include: { user: true },
    });
  }

  private async createUserAndAuthFromOauth(user: OAuthUser) {
    const { email, name, providerId, provider } = user;

    const username = await this.convertDisplayNameToUsername(name);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username, displayName: name },
      });

      const newAuth = await tx.auth.create({
        data: {
          userId: newUser.id,
          provider,
          providerId,
        },
        include: { user: true },
      });

      return newAuth;
    });
  }

  private async createAuthForExistingUser(
    user: User,
    provider: Provider,
    providerId: string,
  ) {
    return await this.prisma.auth.create({
      data: {
        userId: user.id,
        provider,
        providerId,
      },
      include: { user: true },
    });
  }

  // User and Auth helper functions
  private async checkEmailIsTaken(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return existingUser ? true : false;
  }

  private async checkUsernameIsTaken(username: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    return existingUser ? true : false;
  }

  private async getLocalAuth(email: string) {
    const auth = await this.prisma.auth.findFirst({
      where: {
        provider: Provider.LOCAL,
        providerId: email,
      },
      include: {
        user: true,
      },
    });

    return auth;
  }

  // Password functions
  private async hashPassword(password: string) {
    const saltRounds = this.env.saltRounds;
    return await bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  // Username functions
  private async generateRandomUsername() {
    const base = `${this.getRandomAdjective()}_${this.getRandomNoun()}`;

    return await this.generateUniqueUsername(base);
  }

  private async convertDisplayNameToUsername(displayName: string) {
    const words = displayName.split(/\s+/).filter(Boolean);
    const base = words.length > 1 ? `${words[0]}${words[1]}` : words[0];

    const sanitizedBase = this.sanitizeForUsername(base);
    return await this.generateUniqueUsername(sanitizedBase);
  }

  private async generateUniqueUsername(baseUsername: string) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const randomNumber = Math.floor(Math.random() * 10000);
      const username = `${baseUsername}_${randomNumber}`;

      const existing = await this.checkUsernameIsTaken(username);
      if (!existing) {
        return username;
      }
    }

    // Fallback if all attempts collide
    return `user_${Date.now()}`;
  }

  private sanitizeForUsername(input: string) {
    if (!input || typeof input !== "string") {
      return "user";
    }

    // Convert to lowercase and replace non-alphanumeric with underscores
    let sanitized = input.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    // Collapse multiple underscores into single underscores
    sanitized = sanitized.replace(/_+/g, "_");

    // Remove leading/trailing underscores
    sanitized = sanitized.replace(/^_+|_+$/g, "");

    // If empty or too short after sanitization, return default
    if (!sanitized || sanitized.length < 2) {
      return "user";
    }

    return sanitized;
  }

  private getRandomAdjective() {
    const ADJECTIVES = [
      "brave",
      "calm",
      "swift",
      "clever",
      "bright",
      "mellow",
      "wild",
      "bold",
      "quiet",
      "lucky",
    ];

    return ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  }

  private getRandomNoun() {
    const NOUNS = [
      "lion",
      "falcon",
      "river",
      "forest",
      "storm",
      "phoenix",
      "panda",
      "mountain",
      "comet",
      "dream",
    ];

    return NOUNS[Math.floor(Math.random() * NOUNS.length)];
  }
}
