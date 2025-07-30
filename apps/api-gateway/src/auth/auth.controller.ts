import { Body, Controller, Inject, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH-SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  async login(
    @Body() credentials: { username: string; password: string },
    @Res() res: Response, // usamos la respuesta nativa
  ): Promise<void> {
    // obtenemos el JWT del microservicio
    const { access_token } = await firstValueFrom(
      this.authClient.send<{ access_token: string }>('auth-login', credentials),
    );

    // lo escribimos en la cabecera estándar
    res.setHeader('Authorization', `Bearer ${access_token}`);

    // sin cuerpo; 204 = No Content
    res.status(204).send();
  }
}
