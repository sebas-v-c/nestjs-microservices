import { NestFactory } from '@nestjs/core';
import { FinancieroModule } from './financiero.module';
import { ServerCredentials } from '@grpc/grpc-js';
import { readFileSync } from 'fs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FINANCIERO_PACKAGE_NAME } from '@app/proto-types/financiero';
import { Logger } from '@nestjs/common';

/**
 * Lee un archivo del sistema y devuelve su contenido como Buffer.
 *
 * Utilidad para cargar certificados y llaves requeridos por TLS/mTLS.
 *
 * @param f Ruta del archivo a leer desde disco.
 * @returns Buffer con el contenido del archivo.
 */
function read(f: string) {
  return readFileSync(f);
}

/**
 * Punto de entrada del microservicio Financiero (gRPC).
 *
 * - Configura las credenciales TLS del servidor (mTLS) usando la CA y los
 *   certificados locales.
 * - Crea una microaplicación Nest con transporte gRPC y opciones derivadas del
 *   contrato protobuf del dominio Financiero.
 * - Inicia la escucha de solicitudes entrantes y registra un log de arranque.
 *
 * Consideraciones de despliegue:
 * - Asegúrate de que el host en `options.url` coincida con el SAN/CN del certificado.
 * - Mantén rutas de certificados, host y puerto en variables de entorno en producción.
 *
 * @returns Promesa resuelta cuando el microservicio queda escuchando el canal gRPC.
 */
async function bootstrap() {
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

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FinancieroModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:3003',
        package: FINANCIERO_PACKAGE_NAME,
        protoPath: './proto/financiero.proto',
        credentials: serverCreds,
        // this is required to keep the case of the keys in the response
        loader: {
          keepCase: true,
        },
      },
    },
  );
  app.enableShutdownHooks();

  // app.useGlobalFilters(new GrpcExceptionFilter());
  await app.listen();
  Logger.log('Financiero Service is running GRPC...');
}

void bootstrap();
