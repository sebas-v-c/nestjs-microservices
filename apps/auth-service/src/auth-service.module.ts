import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServiceService } from './auth-service.service';
import { JwtModule } from '@nestjs/jwt';

/**
 * AuthServiceModule
 *
 * Módulo raíz del micro-servicio de autenticación.
 * Se encarga de registrar los componentes necesarios para generar
 * y validar JWTs y exponerlos mediante un transporte TCP.
 *
 * • `JwtModule.register` configura secret y expiración de los tokens.
 * • `controllers`        expone los `MessagePattern`s (AuthServiceController).
 * • `providers`          contiene la lógica de negocio (AuthServiceService).
 */
@Module({
  imports: [
    JwtModule.register({
      // Secret de uso interno para firmar tokens (reemplazar en producción).
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
