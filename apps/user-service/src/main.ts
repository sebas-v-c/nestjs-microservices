import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';

/**
 * Arranca el microservicio de **User Service** usando transporte TCP.
 *
 * • Host: 127.0.0.1
 * • Puerto: 8878
 *
 * Se ejecuta como microservicio (no HTTP) y queda escuchando peticiones
 * entrantes hasta que el proceso finaliza.
 */
async function bootstrap(): Promise<void> {
  // Creamos la aplicación como micro-servicio TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 8878,
        tlsOptions: {
          key: readFileSync('./certs/server.key'),
          cert: readFileSync('./certs/server.crt'),
          ca: readFileSync('./certs/ca.crt'),
          requestCert: true,
          rejectUnauthorized: true,
        },
      },
    },
  );

  // Iniciamos la escucha
  await app.listen();

  // Mensaje informativo al iniciar correctamente
  Logger.log('User Service is running TCP...');
}

// Punto de entrada
bootstrap();
