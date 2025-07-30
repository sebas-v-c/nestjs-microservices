import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './auth/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user/user.controller';

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
          host: '127.0.0.1',
          port: 8877, // puerto del servicio de autenticación
        },
      },
      {
        name: 'USER-SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 8878, // puerto del servicio de usuarios
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, AuthController, UserController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
