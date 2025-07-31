import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          message: err.constraints ?? 'Invalid value',
        }));
        throw new BadRequestException({
          errors: formattedErrors,
        });
      },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth Microservice')
    .setDescription('Microsercio para autenticar usuarios')
    .setVersion('0.1')
    .addTag('Auth') // Optional: Add tags if necessary
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
