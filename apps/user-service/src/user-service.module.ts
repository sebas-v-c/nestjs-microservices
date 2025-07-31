import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServiceService } from './user-service.service';

/**
 * UserServiceModule
 *
 * Módulo de NestJS que agrupa todos los artefactos relacionados con el
 * micro-servicio de usuarios.
 *
 * • `controllers`: controla los mensajes entrantes (`UserServiceController`).
 * • `providers`  : contiene la lógica de negocio (`UserServiceService`).
 *
 * Se exporta para que pueda ser importado desde el bootstrap principal.
 */
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
