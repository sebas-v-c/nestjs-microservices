import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ServerCredentials } from '@grpc/grpc-js';
import { USERS_PACKAGE_NAME } from '@app/proto-types/users';

function read(f: string) {
  return readFileSync(f);
}

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
  // Creamos la aplicación como microservicio TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:3002',
        package: USERS_PACKAGE_NAME,
        protoPath: './proto/users.proto',
        credentials: serverCreds,
        // this is required to keep the case of the keys in the response
        loader: {
          keepCase: true,
        },
      },
    },
  );

  // Iniciamos la escucha
  await app.listen();

  // Mensaje informativo al iniciar correctamente
  Logger.log('User Service is running GRPC...');
}

// Punto de entrada
void bootstrap();
