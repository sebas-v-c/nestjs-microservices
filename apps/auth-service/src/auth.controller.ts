import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  Token,
  UserAccess,
  UserCredentials,
  ValidUser,
} from '@app/proto-types/auth';

/**
 * AuthServiceController
 *
 * Controlador basado en mensajería (no HTTP) que atiende
 * operaciones de autenticación.
 *
 * Cada método está decorado con `@MessagePattern`, lo que permite que
 * otros micro-servicios envíen mensajes TCP con el patrón indicado
 * para ejecutar la acción correspondiente.
 */
@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  /**
   * Inyecta el servicio de autenticación.
   * @param authServiceService Lógica de generación y validación de JWT.
   */
  constructor(private readonly authServiceService: AuthServiceService) {}

  async login(request: UserCredentials): Promise<UserAccess> {
    return this.authServiceService.login(request);
  }

  async validateToken(request: Token): Promise<ValidUser> {
    return this.authServiceService.validateToken(request.token);
  }
}
