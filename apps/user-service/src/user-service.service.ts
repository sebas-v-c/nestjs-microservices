import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * Servicio de dominio para la entidad Usuario.
 *
 * Responsabilidades:
 * - Encapsular la lógica de negocio relacionada con usuarios.
 * - Orquestar el acceso a datos (en este ejemplo, una "BD" en memoria).
 *
 * Notas:
 * - Este servicio es puramente ilustrativo. En un escenario real, reemplaza
 *   el arreglo en memoria por un repositorio/persistencia (p.ej. Prisma/TypeORM).
 */
@Injectable()
export class UserServiceService {
  /**
   * Almacenamiento en memoria para usuarios.
   *
   * Estructura:
   * - `id`: identificador único del usuario.
   * - `username`: nombre de usuario legible.
   *
   * Importante:
   * - Solo para demostración. Sustituir por persistencia real en producción.
   */
  private users: Array<{ id: string; username: string }> = [
    { id: '123', username: 'John Doe' },
  ];

  /**
   * Obtiene el perfil de un usuario por su identificador.
   *
   * Comportamiento:
   * - Busca dentro del almacenamiento en memoria un usuario cuyo `id` coincida
   *   con `userId`.
   * - Si no existe, lanza `NotFoundException` con el mensaje "User not found".
   *
   * @param userId Identificador del usuario a consultar.
   * @returns Promesa que resuelve con el objeto usuario `{ id, username }`.
   * @throws NotFoundException Si no se encuentra un usuario con el `id` indicado.
   */
  async getUserProfile(
    userId: string,
  ): Promise<{ id: string; username: string }> {
    const user = this.users.find((user) => user.id === userId) ?? null;
    if (!user) throw new NotFoundException('User not found');
    return Promise.resolve(user);
  }
}
