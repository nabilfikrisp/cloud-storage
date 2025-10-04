import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class SignUpDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Email must be a valid email address" })
  email!: string;

  @ApiProperty({ description: "The username of the user", example: "john_doe" })
  @IsString({ message: "Username must be a string" })
  @Length(3, 20, { message: "Username must be between 3 and 20 characters" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  })
  username!: string;

  @ApiProperty({
    description: "The password of the user",
    example: "Password123!",
  })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password cannot be empty" })
  @Length(8, 50, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      "Password must contain uppercase, lowercase, number, and special character",
  })
  password!: string;
}
