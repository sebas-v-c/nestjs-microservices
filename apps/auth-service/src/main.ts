import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { AUTH_PACKAGE_NAME } from '@app/proto-types/auth';
import { ServerCredentials } from '@grpc/grpc-js';

function read(f: string) {
  return readFileSync(f);
}

/**
 * Entry-point para el microservicio **Auth Service**.
 *
 * El servicio se levanta como microservicio TCP escuchando en `127.0.0.1:8877`.
 * Una vez iniciado permanece a la espera de mensajes hasta que el proceso
 * finaliza.
 *
 * Uso:
 * ```bash
 * node dist/main.js   # o `npm run start:prod`
 * ```
 */
async function bootstrap(): Promise<void> {
  const serverCreds = ServerCredentials.createSsl(
    read('./certs/ca.crt'),
    [
      {
        private_key: read('./certs/server.key'),
        cert_chain: read('./certs/server.crt'),
      },
    ],
    true,
  );
  // Crea la aplicación de Nest en modo Microservice usando transporte TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:3001',
        package: AUTH_PACKAGE_NAME,
        protoPath: './proto/auth.proto',
        credentials: serverCreds,
      },
    },
  );

  // Comienza a escuchar peticiones entrantes
  await app.listen();

  // Log en consola indicando que el servicio está operativo
  Logger.log('Auth Service is running on gRPC channel...');
}

// Ejecuta el bootstrap al iniciar el proceso
bootstrap();
