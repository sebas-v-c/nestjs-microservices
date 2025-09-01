import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { HttpFromGrpcErrorFilter } from './filters/http-from-grpc-error.filter';

/**
 * Punto de entrada de la aplicación API Gateway.
 *
 * - Inicializa la app Nest con logging basado en Pino.
 * - Configura validación global de DTO con `ValidationPipe`.
 * - Registra un filtro global para traducir errores gRPC a HTTP.
 * - Expone documentación OpenAPI/Swagger en `/api/docs`.
 * - Levanta el servidor HTTP en el puerto configurado.
 */
async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  /**
   * Validación global:
   * - transform: convierte payloads a las clases DTO definidas.
   * - whitelist: elimina propiedades no declaradas en el DTO.
   * - forbidNonWhitelisted: lanza error si llegan propiedades extra.
   * - exceptionFactory: normaliza el formato de error para respuestas 400.
   */
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

  // Filtro global: mapea códigos de gRPC a HTTP y formatea el mensaje de error.
  app.useGlobalFilters(new HttpFromGrpcErrorFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth Microservice gRPC')
    .setDescription('Plantilla de nest con microservicios gRPC')
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Introduce: Bearer <JWT>',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
