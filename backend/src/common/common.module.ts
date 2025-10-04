import { BadRequestException, Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
          const formattedErrors = errors.flatMap((err) =>
            Object.values(err.constraints || {}),
          );

          return new BadRequestException({
            message: "Validation Error",
            errors: formattedErrors,
            statusCode: 400,
          });
        },
      }),
    },
  ],
  exports: [],
})
export class CommonModule {}
