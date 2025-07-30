import { Controller } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

/**
 * UserServiceController
 *
 * Controlador basado en mensajes (no HTTP) que atiende las acciones relativas
 * a usuarios. Escucha el patrón `"get-user-profile"` y delega la lógica al
 * servicio correspondiente.
 */
@Controller()
export class UserServiceController {
  /**
   * Crea una instancia del controlador e inyecta el servicio de usuarios.
   *
   * @param userServiceService Servicio con la lógica de negocio de usuarios.
   */
  constructor(private readonly userServiceService: UserServiceService) {}

  /**
   * Devuelve el perfil de un usuario dado su identificador.
   *
   * @messagePattern "get-user-profile"
   * @param userId Identificador del usuario solicitado.
   * @returns Promesa que resuelve con el perfil del usuario o `null` si no se
   *          encuentra.
   */
  @MessagePattern('get-user-profile')
  async getUserProfile(@Payload() userId: string) {
    return this.userServiceService.getUserProfile(userId);
  }
}
