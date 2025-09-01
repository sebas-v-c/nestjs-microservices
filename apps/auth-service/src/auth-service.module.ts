import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServiceService } from './auth-service.service';
import { JwtModule } from '@nestjs/jwt';

/**
 * AuthServiceModule
 *
 * Módulo raíz del microservicio de autenticación (gRPC).
 *
 * Responsabilidades:
 * - Registrar y configurar proveedores necesarios para firmar y validar JWT.
 * - Exponer controladores generados a partir del contrato gRPC.
 * - Definir el contenedor de dependencias del servicio de autenticación.
 *
 * Componentes:
 * - imports:
 *   • JwtModule.register: Configura el secreto y la expiración de los tokens.
 *     Recomendación: mover `secret` y `expiresIn` a variables de entorno
 *     (por ejemplo, JWT_SECRET y JWT_EXPIRES_IN) y habilitar rotación de claves
 *     en entornos productivos.
 * - controllers:
 *   • AuthController: Implementa los handlers RPC definidos en el contrato.
 * - providers:
 *   • AuthServiceService: Lógica de negocio para login y validación de tokens.
 */
@Module({
  imports: [
    // Configuración local de ejemplo. Sustituir por variables de entorno en producción.
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
