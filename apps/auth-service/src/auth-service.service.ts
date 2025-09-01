import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials /*, ValidUser*/ } from '@app/proto-types/auth';

/**
 * AuthServiceService
 *
 * Contiene la lógica de negocio para:
 * • Autenticar usuarios (demo in-memory).
 * • Generar y firmar JWTs.
 * • Verificar la validez de un JWT entrante.
 *
 * Notas de seguridad:
 * - Sustituye las credenciales "hard-coded" por un repositorio real.
 * - Mantén el secreto del JWT y tiempos de expiración en variables de entorno.
 */

@Injectable()
export class AuthServiceService {
  /**
   * Crea una instancia del servicio inyectando JwtService.
   * @param jwtService Servicio de Nest encargado de firmar y verificar JWTs.
   */
  constructor(private jwtService: JwtService) {}

  /**
   * Autentica al usuario y genera un token.
   *
   * Este método es solo de demostración: la validación de credenciales
   * está “hard-coded”. Sustitúyelo por una consulta a base de datos
   * o proveedor externo en un entorno real.
   *
   * @param credential Credenciales `{ username, password }` enviadas por el consumidor.
   * @returns Objeto de acceso conforme al contrato RPC (`UserAccess`), e.g. `{ accessToken }`.
   * @throws UnauthorizedException Si el usuario/contraseña no coinciden.
   */
  async login(credential: UserCredentials): Promise<{ accessToken: string }> {
    // Demo: autenticación simplificada
    if (credential.username === 'admin' && credential.password === 'password') {
      const payload = {
        id: '123',
        username: credential.username,
        role: 'admin',
      };
      const token = await this.jwtService.signAsync(payload);
      return { accessToken: token };
    }
    throw new UnauthorizedException('Invalid Credentials');
  }

  /**
   * Valida un JWT y extrae los datos que contiene.
   *
   * @param token JWT a verificar.
   * @returns Resultado de validación conforme al contrato RPC (`ValidUser`):
   *          • `valid`  : indica si el token es válido.
   *          • `userId` : ID del usuario o cadena vacía si no es válido.
   *          • `role`   : Rol del usuario o cadena vacía si no es válido.
   */
  async validateToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        id: string;
        username: string;
        role: string;
      }>(token);
      return { valid: true, userId: decoded.id, role: decoded.role };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return { valid: false, userId: '', role: '' };
    }
  }
}
