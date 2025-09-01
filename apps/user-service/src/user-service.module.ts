import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServiceService } from './user-service.service';

/**
 * Módulo raíz del microservicio de Usuarios (gRPC).
 *
 * Responsabilidades:
 * - Declarar el controlador que implementa los handlers definidos por el contrato de Usuarios.
 * - Registrar el servicio de dominio con la lógica de negocio relacionada a usuarios.
 *
 * Estructura:
 * - controllers: expone los handlers RPC (UserController).
 * - providers  : contiene la lógica de negocio (UserServiceService).
 *
 * Notas:
 * - No expone endpoints HTTP; este módulo se consume en un bootstrap gRPC.
 */
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
