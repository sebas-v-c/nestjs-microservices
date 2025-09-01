import { Controller, Get, Inject, OnModuleInit, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  USER_SERVICE_NAME,
  UserRequest,
  USERS_PACKAGE_NAME,
  UserServiceClient,
} from '@app/proto-types/users';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Controlador HTTP para operaciones de usuario en el API Gateway.
 *
 * - Expone endpoints REST y delega la lógica en el microservicio gRPC de Usuarios.
 * - Inicializa el cliente gRPC tipado durante el ciclo de vida del módulo.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController implements OnModuleInit {
  /**
   * Cliente gRPC tipado para el servicio de Usuarios.
   * Se asigna en `onModuleInit` usando el `ClientGrpc` inyectado.
   */
  private userService: UserServiceClient;

  /**
   * Inyecta el cliente gRPC asociado al paquete de usuarios.
   *
   * @param userClient Cliente gRPC configurado con `USERS_PACKAGE_NAME`.
   */
  constructor(
    @Inject(USERS_PACKAGE_NAME) private readonly userClient: ClientGrpc,
  ) {}

  /**
   * Hook del ciclo de vida de NestJS.
   * Obtiene la implementación del `UserServiceClient` a partir del `ClientGrpc`.
   */
  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  // @UseGuards(AuthGuard)

  /**
   * GET /user
   *
   * Recupera el perfil del usuario autenticado.
   *
   * - Obtiene el `userId` inyectado en la request (por ejemplo, por un guard de autenticación).
   * - Invoca al método gRPC `getUserProfile` y transforma el Observable a Promesa.
   *
   * @param req Request HTTP que contiene `user` con la forma `{ userId, role? }`.
   * @returns Promesa con el perfil del usuario retornado por el microservicio.
   */
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({
    description: 'Perfil obtenido correctamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123' },
        username: { type: 'string', example: 'john.doe' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token faltante o inválido' })
  @Get()
  async getUserProfile(@Req() req: Request & { user: UserRequest }) {
    const userId = req.user.userId;
    const userObservable = this.userService.getUserProfile({ userId });
    return await firstValueFrom(userObservable);
  }
}
