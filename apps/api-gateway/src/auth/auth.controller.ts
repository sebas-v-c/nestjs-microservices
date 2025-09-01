import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/proto-types/auth';
import { Public } from '../public.decorator';
import { UserCredentialsDto } from './dto/UserCredentials.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Controlador HTTP para endpoints de autenticación.
 *
 * Expone rutas públicas relacionadas con el proceso de login
 * y delega la autenticación en el microservicio gRPC de Auth.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  /**
   * Cliente tipado del servicio gRPC de autenticación.
   * Se inicializa en el hook onModuleInit.
   */
  private authService: AuthServiceClient;

  /**
   * Inyecta el cliente gRPC asociado al paquete de autenticación.
   *
   * @param authClient Cliente gRPC configurado para el paquete AUTH_PACKAGE_NAME.
   */
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  /**
   * Hook del ciclo de vida de NestJS.
   * Inicializa el cliente tipado del servicio de autenticación a partir del ClientGrpc inyectado.
   */
  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  /**
   * Inicia sesión con credenciales de usuario.
   *
   * - Delega el login al microservicio gRPC de Auth.
   * - Escribe el JWT resultante en la cabecera estándar `Authorization` como `Bearer <token>`.
   * - Responde con código 204 (No Content) y sin cuerpo.
   * - Ruta pública (no requiere guard de autenticación).
   *
   * @param credentials Credenciales del usuario (DTO validado por pipes globales).
   * @param res Respuesta nativa de Express para controlar cabeceras y estado.
   * @returns void (la respuesta se envía directamente con `res`).
   *
   * @throws Propaga errores del microservicio de autenticación (por ejemplo, credenciales inválidas).
   */
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna el JWT en la cabecera Authorization (Bearer <token>)',
  })
  @ApiBody({ type: UserCredentialsDto })
  @ApiNoContentResponse({
    description:
      'Autenticación exitosa. El token JWT se devuelve en la cabecera Authorization',
    headers: {
      Authorization: {
        description: 'Bearer <JWT>',
        schema: {
          type: 'string',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  @Public()
  @Post('login')
  async login(
    @Body() credentials: UserCredentialsDto,
    @Res() res: Response, // usamos la respuesta nativa
  ): Promise<void> {
    // obtenemos el JWT del microservicio
    const { accessToken } = await firstValueFrom(
      this.authService.login(credentials),
    );

    // lo escribimos en la cabecera estándar
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    // sin cuerpo; 204 = No Content
    res.status(204).send();
  }
}
