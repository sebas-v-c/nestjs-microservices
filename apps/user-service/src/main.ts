import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ServerCredentials } from '@grpc/grpc-js';
import { USERS_PACKAGE_NAME } from '@app/proto-types/users';

/**
 * Lee un archivo desde disco y devuelve su contenido como Buffer.
 *
 * Útil para cargar certificados y llaves requeridos por TLS/mTLS.
 *
 * @param f Ruta del archivo.
 * @returns Contenido del archivo como Buffer.
 */
function read(f: string) {
  return readFileSync(f);
}

/**
 * Punto de entrada del microservicio de Usuarios (gRPC).
 *
 * - Configura credenciales TLS del servidor (mTLS) usando CA, certificado y llave.
 * - Crea una microaplicación Nest con transporte gRPC y opciones del paquete de Usuarios.
 * - Inicia la escucha de peticiones entrantes y registra un log de arranque.
 *
 * Consideraciones de despliegue:
 * - Asegura que el host en `options.url` coincida con el SAN/CN del certificado.
 * - Gestiona rutas de certificados y parámetros de red mediante variables de entorno en producción.
 *
 * @returns Promesa resuelta cuando el microservicio queda escuchando el canal gRPC.
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

  app.enableShutdownHooks();
  // Iniciamos la escucha
  await app.listen();

  // Mensaje informativo al iniciar correctamente
  Logger.log('User Service is running GRPC...');
}

// Punto de entrada
void bootstrap();
