import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { RequestMethod } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api", {
    exclude: [{ path: "", method: RequestMethod.GET }],
  });

  const config = new DocumentBuilder()
    .setTitle("Blog API")
    .setDescription("The Blog API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory, {
    jsonDocumentUrl: "api-json",
  });

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err) => {
  console.error("Error during bootstrap:", err);
  process.exit(1);
});
