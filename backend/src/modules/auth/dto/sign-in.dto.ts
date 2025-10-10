import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
    required: true,
  })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail({}, { message: "Email must be a valid email address" })
  email!: string;

  @ApiProperty({
    description: "The password of the user",
    example: "Password123!",
    required: true,
  })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password cannot be empty" })
  password!: string;
}
