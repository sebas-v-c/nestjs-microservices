import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

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
export class AuthServiceController {
  /**
   * Inyecta el servicio de autenticación.
   * @param authServiceService Lógica de generación y validación de JWT.
   */
  constructor(private readonly authServiceService: AuthServiceService) {}

  /**
   * Autentica al usuario y devuelve un JWT de acceso.
   *
   * @messagePattern "auth-login"
   * @param credential Objeto con `username` y `password`.
   * @returns Promesa que resuelve con `{ access_token: string }`
   *          o lanza `UnauthorizedException` en caso de credenciales inválidas.
   */
  @MessagePattern('auth-login')
  async login(@Payload() credential: { username: string; password: string }) {
    return this.authServiceService.login(credential);
  }

  /**
   * Valida un JWT y devuelve su estado.
   *
   * @messagePattern "auth-validate-token"
   * @param token JWT recibido.
   * @returns `{ valid: boolean; userId: string | null; role: string | null }`
   *          indicando si el token es válido y los datos embebidos.
   */
  @MessagePattern('auth-validate-token')
  async validateToken(@Payload() token: string) {
    return this.authServiceService.validateToken(token);
  }
}
