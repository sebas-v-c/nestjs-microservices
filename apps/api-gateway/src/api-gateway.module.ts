import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user/user.controller';
import { readFileSync } from 'fs';
import { ChannelCredentials } from '@grpc/grpc-js';
import { AUTH_PACKAGE_NAME } from '@app/proto-types/auth';
import { USERS_PACKAGE_NAME } from '@app/proto-types/users';
import { LoggerModule } from 'nestjs-pino';

function read(f: string) {
  return readFileSync(f);
}

const clientCreds = ChannelCredentials.createSsl(
  read('./certs/ca.crt'),
  read('./certs/client.key'),
  read('./certs/client.crt'),
  {
    rejectUnauthorized: true,
  },
);

/**
 * ApiGatewayModule
 *
 * Módulo principal del **API Gateway**.
 * Orquesta la comunicación entre el front-end (peticiones HTTP) y los
 * microservicios de autenticación y usuarios a través de transporte TCP.
 *
 * Características clave
 * ---------------------
 * • Expone controladores HTTP (`ApiGatewayController`, `AuthController`, `UserController`).
 * • Registra dos _client proxies_:
 *   - `AUTH-SERVICE`  → Microservicio de autenticación (puerto 8877).
 *   - `USER-SERVICE`  → Microservicio de usuarios       (puerto 8878).
 * • El bloque comentado explica la intención de implementar mTLS para
 *   cumplir con Zero-Trust Communication (TLS mutuo host ↔ cliente).
 */
@Module({
  /*
    Implement mTLS (Mutual Transport Layer Security).
    Extension of TLS (only server presents certificate).
    mTLS (both client and server present certificates).
    All communication is encrypted,
    so no need to relay on API keys or tokens,
    and we comply with Zero Trust Communication
  */

  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty', // bonito en consola; quítalo en prod
          options: { translateTime: 'SYS:standard' },
        },
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          // ⚠️ IMPORTANTE:
          // El valor de `host` DEBE coincidir con alguno de los nombres/IP
          // incluidos en el certificado del servidor (SAN o, de forma
          // retro-compat, CN).  Si tu CSR se generó con `/CN=localhost` (o
          // SAN:DNS:localhost) **no uses `127.0.0.1` aquí**, de lo contrario
          // Node lanzará `ERR_TLS_CERT_ALTNAME_INVALID`.
          url: 'localhost:3001',
          package: AUTH_PACKAGE_NAME,
          protoPath: './proto/auth.proto',
          credentials: clientCreds,
        },
      },
      {
        name: USERS_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          // Mismo razonamiento que arriba: mantén coherencia entre certificado
          // y endpoint real.
          url: 'localhost:3002',
          package: USERS_PACKAGE_NAME,
          protoPath: './proto/users.proto',
          credentials: clientCreds,
        },
      },
    ]),
  ],
  controllers: [AuthController, UserController],
  providers: [],
})
export class ApiGatewayModule {}
