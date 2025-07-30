import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH-SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader)
      throw new UnauthorizedException('missing authorization header');
    // Bearer token
    const token = authHeader.split(' ')[1];

    // this sends an observable, so to await from this response, we need to wrap it
    // inside firstBalueFrom to turn this observable into a promise
    const result = await firstValueFrom(
      this.authClient.send('auth-validate-token', token),
    );

    if (!result.valid) throw new UnauthorizedException('invalid token');

    req.user = { userId: result.userId, role: result.role };
    return true;
  }
}
