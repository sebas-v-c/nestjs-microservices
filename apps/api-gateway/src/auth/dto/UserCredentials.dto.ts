import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para credenciales de usuario utilizadas en el proceso de autenticación.
 *
 * - Se usa como cuerpo de la petición en el endpoint de login.
 * - Incluye validaciones con class-validator y metadatos para Swagger.
 */
export class UserCredentialsDto {
  /**
   * Nombre de usuario con el que se autentica el cliente.
   *
   * Reglas:
   * - Debe ser una cadena no vacía.
   */
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  /**
   * Contraseña asociada al usuario.
   *
   * Reglas:
   * - Debe ser una cadena no vacía.
   */
  @ApiProperty({ example: 'password', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
