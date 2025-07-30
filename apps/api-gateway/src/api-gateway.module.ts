import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './auth/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user/user.controller';
import { readFileSync } from 'fs';

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
    ClientsModule.register([
      {
        name: 'AUTH-SERVICE',
        transport: Transport.TCP,
        options: {
          // ⚠️ IMPORTANTE:
          // El valor de `host` DEBE coincidir con alguno de los nombres/IP
          // incluidos en el certificado del servidor (SAN o, de forma
          // retro-compat, CN).  Si tu CSR se generó con `/CN=localhost` (o
          // SAN:DNS:localhost) **no uses `127.0.0.1` aquí**, de lo contrario
          // Node lanzará `ERR_TLS_CERT_ALTNAME_INVALID`.
          host: 'localhost',
          port: 8877,
        },
      },
      {
        name: 'USER-SERVICE',
        transport: Transport.TCP,
        options: {
          // Mismo razonamiento que arriba: mantén coherencia entre certificado
          // y endpoint real.
          host: 'localhost',
          port: 8878,
          tlsOptions: {
            key: readFileSync('./certs/client.key'),
            cert: readFileSync('./certs/client.crt'),
            ca: readFileSync('./certs/ca.crt'),
            requestCert: true,
            rejectUnauthorized: true,
          },
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, AuthController, UserController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}