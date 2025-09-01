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
 * Controlador gRPC/microservicio para autenticación.
 *
 * Implementa la interfaz generada del servicio (`AuthServiceController`)
 * y expone handlers que serán invocados por RPC conforme al contrato
 * definido en los tipos generados.
 *
 * Responsabilidades:
 * - Delegar la lógica de autenticación al `AuthServiceService`.
 * - Mantener la forma de entrada/salida definida por el contrato (UserCredentials, UserAccess, etc.).
 */
@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  /**
   * Crea una instancia del controlador e inyecta el servicio de autenticación.
   *
   * @param authServiceService Servicio de dominio que implementa login y validación de tokens.
   */
  constructor(private readonly authServiceService: AuthServiceService) {}

  /**
   * Realiza el proceso de login con credenciales de usuario.
   *
   * - Valida credenciales y emite un token de acceso (por ejemplo, JWT).
   * - Devuelve un objeto `UserAccess` conforme al contrato RPC.
   *
   * Errores:
   * - Puede lanzar excepciones de negocio o `RpcException` según reglas del dominio.
   *
   * @param request Credenciales del usuario (username, password).
   * @returns Estructura con información de acceso (p.ej. `accessToken`, expiración, etc.).
   */
  async login(request: UserCredentials): Promise<UserAccess> {
    return this.authServiceService.login(request);
  }

  /**
   * Valida un token de acceso emitido previamente.
   *
   * - Comprueba firma y vigencia del token.
   * - Devuelve `ValidUser` con la validez y, si aplica, el identificador de usuario y rol.
   *
   * Errores:
   * - Puede lanzar `RpcException` con códigos gRPC apropiados si el token es inválido o expiró.
   *
   * @param request Objeto con el `token` a validar.
   * @returns Resultado de validación del token y metadatos asociados.
   */
  async validateToken(request: Token): Promise<ValidUser> {
    return this.authServiceService.validateToken(request.token);
  }
}
