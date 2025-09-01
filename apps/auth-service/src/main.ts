import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { AUTH_PACKAGE_NAME } from '@app/proto-types/auth';
import { ServerCredentials } from '@grpc/grpc-js';

/**
 * Lee un archivo del sistema de ficheros y devuelve su contenido.
 *
 * Utilidad para cargar certificados/llaves TLS desde disco.
 *
 * @param f Ruta del archivo a leer.
 * @returns Buffer con el contenido del archivo.
 */
function read(f: string) {
  return readFileSync(f);
}

/**
 * Punto de entrada del microservicio de Autenticación (gRPC).
 *
 * - Configura credenciales TLS del servidor (mTLS) usando certificados locales.
 * - Arranca una aplicación Nest en modo microservicio con transporte gRPC.
 * - Expone los handlers definidos por `AuthServiceModule` conforme al contrato protobuf.
 *
 * Flujo:
 * 1. Construye `ServerCredentials` con CA, certificado y llave del servidor.
 * 2. Crea la microapp (`createMicroservice`) con `Transport.GRPC` y opciones (url, paquete, proto, credenciales).
 * 3. Inicia la escucha de solicitudes entrantes (`app.listen()`).
 *
 * Errores y seguridad:
 * - Asegúrate de que los certificados coincidan con el `url` expuesto (SAN/CN).
 * - Mantén rutas de certificados y endpoints en variables de entorno para producción.
 *
 * @returns Promesa que se resuelve cuando el microservicio queda escuchando.
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
        // this is required to keep the case of the keys in the response
        loader: {
          keepCase: true,
        },
      },
    },
  );

  app.enableShutdownHooks();
  // Comienza a escuchar peticiones entrantes
  await app.listen();

  // Log en consola indicando que el servicio está operativo
  Logger.log('Auth Service is running on gRPC channel...');
}

// Ejecuta el bootstrap al iniciar el proceso
void bootstrap();
