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
import { UserCredentialsDto } from '@app/dto';
import { Public } from '../public.decorator';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

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
