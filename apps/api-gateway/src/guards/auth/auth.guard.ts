import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/proto-types/auth';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../public.decorator';

/**
 * Guard de autenticación para proteger rutas HTTP.
 *
 * - Permite el acceso a rutas marcadas como públicas mediante el metadato `IS_PUBLIC_KEY`.
 * - Para rutas protegidas, valida el JWT con el microservicio de autenticación vía gRPC.
 * - Si el token es válido, adjunta la información del usuario al objeto `request`.
 *
 * Requisitos:
 * - Debe estar registrado en el contexto de la aplicación o del controlador.
 * - Depende de un cliente gRPC inyectado para consultar el AuthService remoto.
 */
@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  /**
   * Cliente tipado del servicio gRPC de autenticación.
   * Se inicializa en el hook `onModuleInit`.
   */
  private authService: AuthServiceClient;

  /**
   * @param reflector Utilidad para leer metadatos de rutas (por ejemplo, `IS_PUBLIC_KEY`).
   * @param authClient Cliente gRPC del paquete de autenticación.
   */
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  /**
   * Hook del ciclo de vida de NestJS.
   * Inicializa `authService` a partir del cliente gRPC inyectado.
   */
  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  /**
   * Lógica principal del guard:
   *
   * 1) Verifica si la ruta está marcada como pública mediante el metadato `IS_PUBLIC_KEY`.
   *    - Si es pública, permite el acceso sin validación.
   * 2) Extrae el encabezado `Authorization` del request y obtiene el token con formato `Bearer <token>`.
   *    - Si falta el encabezado, se lanza `UnauthorizedException`.
   * 3) Valida el token contra el AuthService gRPC (`validateToken`).
   *    - Si no es válido, se lanza `UnauthorizedException`.
   * 4) En caso de éxito, adjunta `{ userId, role }` al `request` y permite el acceso.
   *
   * @param context Contexto de ejecución para acceder al request HTTP.
   * @returns `true` si la petición está autorizada.
   * @throws UnauthorizedException Cuando falta el header o el token es inválido.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check if the route is marked as public with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // get request object
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader)
      throw new UnauthorizedException('missing authorization header');
    // Bearer token
    const token = authHeader.split(' ')[1];

    // this sends an observable, so to await from this response, we need to wrap it
    // inside firstBalueFrom to turn this observable into a promise
    const result = await firstValueFrom(
      this.authService.validateToken({ token: token }),
    );

    if (!result.valid) throw new UnauthorizedException('invalid token');

    req['user'] = { userId: result.userId, role: result.role };
    return true;
  }
}
