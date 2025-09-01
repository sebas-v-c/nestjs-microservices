import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadato utilizada para marcar rutas y controladores como "públicos".
 *
 * Se consulta típicamente con `Reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [...])`
 * dentro de un AuthGuard para omitir la verificación de autenticación.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador `@Public()`
 *
 * Marca un controlador o un handler específico como público, es decir, excluido
 * de la autenticación por parte de guards globales (por ejemplo, un `AuthGuard`).
 *
 * Uso:
 * - A nivel de método:
 *   `@Public()`
 *   `@Get('login')`
 *   `login() { ... }`
 *
 * - A nivel de clase:
 *   `@Public()`
 *   `@Controller('public')`
 *   `export class PublicController { ... }`
 *
 * Implementación:
 * - Establece el metadato `IS_PUBLIC_KEY` con valor `true` en el elemento decorado.
 * - Un guard puede consultar este metadato para permitir el acceso sin validar token.
 *
 * @returns Decorador que aplica el metadato `isPublic=true`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
