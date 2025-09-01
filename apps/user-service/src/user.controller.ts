import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
/* import { MessagePattern, Payload } from '@nestjs/microservices'; */
import {
  UserRequest,
  UserResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from '@app/proto-types/users';
/* import { Observable } from 'rxjs'; */

/**
 * Controlador gRPC/microservicio para operaciones de Usuario.
 *
 * Implementa la interfaz generada `UserServiceController` y expone handlers
 * invocados por RPC de acuerdo al contrato protobuf de Usuarios.
 *
 * Responsabilidades:
 * - Delegar en `UserServiceService` la lógica de negocio.
 * - Mantener la forma de entrada/salida tipada (`UserRequest`, `UserResponse`).
 *
 * Nota:
 * - Este controlador no expone HTTP; funciona únicamente vía gRPC.
 */
@Controller()
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  /**
   * Crea una instancia del controlador e inyecta el servicio de usuarios.
   *
   * @param userServiceService Servicio con la lógica de negocio de usuarios.
   */
  constructor(private readonly userServiceService: UserServiceService) {}

  /**
   * Handler gRPC: Obtiene el perfil del usuario.
   *
   * - Atiende la operación declarada en el contrato generado (p.ej. `getUserProfile`).
   * - Extrae `userId` del `UserRequest` y delega en el servicio de dominio.
   *
   * Errores:
   * - Puede propagar excepciones de dominio (por ejemplo, `NotFoundException`)
   *   que serán mapeadas por la infraestructura gRPC.
   *
   * @param request Objeto de solicitud con el identificador del usuario.
   * @returns Promesa con el perfil del usuario (`UserResponse`).
   */
  async getUserProfile(request: UserRequest): Promise<UserResponse> {
    return this.userServiceService.getUserProfile(request.userId);
  }

  /**
   * Alternativa basada en patrones de mensajería (deshabilitada).
   *
   * Ejemplo con `@MessagePattern` si no se usan stubs generados:
   *
   * @example
   * // @MessagePattern('get-user-profile')
   * // async getUserProfile(@Payload() userId: string) {
   * //   return this.userServiceService.getUserProfile(userId);
   * // }
   */
  /*
  @MessagePattern('get-user-profile')
  async getUserProfile(@Payload() userId: string) {
    return this.userServiceService.getUserProfile(userId);
  }
   */
}
