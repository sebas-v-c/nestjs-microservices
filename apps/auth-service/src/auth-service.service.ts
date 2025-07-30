import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * AuthServiceService
 *
 * Contiene la lógica de negocio para:
 * • Autenticar usuarios (demo in-memory).
 * • Generar y firmar JWTs.
 * • Verificar la validez de un JWT entrante.
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
   * @param credential `{ username, password }` enviado por el consumidor.
   * @returns `{ access_token: string }` si las credenciales son correctas.
   * @throws UnauthorizedException Si el usuario/contraseña no coinciden.
   */
  async login(credential: {
    username: string;
    password: string;
  }): Promise<{ access_token: string }> {
    // Demo: autenticación simplificada
    if (credential.username === 'admin' && credential.password === 'password') {
      const payload = {
        sub: '123',
        username: credential.username,
        role: 'admin',
      };
      const token = this.jwtService.sign(payload);
      return { access_token: token };
    }
    throw new UnauthorizedException('Invalid Credentials');
  }

  /**
   * Valida un JWT y extrae los datos que contiene.
   *
   * @param token JWT a verificar.
   * @returns Objeto con:
   *          • `valid`  : boolean que indica la validez.
   *          • `userId` : ID del usuario (`sub`) o `null`.
   *          • `role`   : Rol del usuario o `null`.
   */
  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; userId: string | null; role: string | null }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { valid: true, userId: decoded.sub, role: decoded.role };
    } catch (error) {
      return { valid: false, userId: null, role: null };
    }
  }
}
