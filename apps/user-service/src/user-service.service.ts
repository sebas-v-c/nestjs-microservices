import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * UserServiceService
 *
 * Servicio con la lógica de negocio para la entidad _User_.
 * En este ejemplo mantiene un arreglo en memoria para simplificar.
 */
@Injectable()
export class UserServiceService {
  /**
   * Base de datos simulada en memoria.
   * Cada usuario contiene un `id` único y un `username`.
   * En un entorno real esto se sustituiría por una consulta a un repositorio.
   */
  private users: Array<{ id: string; username: string }> = [
    { id: '123', username: 'John Doe' },
  ];

  /**
   * Devuelve el perfil de un usuario dado su identificador.
   *
   * @param userId - Identificador del usuario.
   * @returns Una promesa que resuelve con el usuario encontrado o `null`
   *          si no existe.
   */
  async getUserProfile(
    userId: string,
  ): Promise<{ id: string; username: string }> {
    const user = this.users.find((user) => user.id === userId) ?? null;
    if (!user) throw new NotFoundException('User not found');
    return Promise.resolve(user);
  }
}
