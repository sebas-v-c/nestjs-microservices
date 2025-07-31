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

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authService: AuthServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
