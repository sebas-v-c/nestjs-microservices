import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

/**
 * Entry-point para el micro-servicio **Auth Service**.
 *
 * El servicio se levanta como micro-servicio TCP escuchando en `127.0.0.1:8877`.
 * Una vez iniciado permanece a la espera de mensajes hasta que el proceso
 * finaliza.
 *
 * Uso:
 * ```bash
 * node dist/main.js   # o `npm run start:prod`
 * ```
 */
async function bootstrap(): Promise<void> {
  // Crea la aplicación de Nest en modo Microservice usando transporte TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    },
  );

  // Comienza a escuchar peticiones entrantes
  await app.listen();

  // Log en consola indicando que el servicio está operativo
  Logger.log('Auth Service is running TCP...');
}

// Ejecuta el bootstrap al iniciar el proceso
bootstrap();
