import { Controller, Get, Inject, OnModuleInit, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  USER_SERVICE_NAME,
  UserRequest,
  USERS_PACKAGE_NAME,
  UserServiceClient,
} from '@app/proto-types/users';

@Controller('user')
export class UserController implements OnModuleInit {
  private userService: UserServiceClient;
  constructor(
    @Inject(USERS_PACKAGE_NAME) private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  // @UseGuards(AuthGuard)
  @Get()
  async getUserProfile(@Req() req: Request & { user: UserRequest }) {
    const userId = req.user.userId;
    const userObservable = this.userService.getUserProfile({ userId });
    return await firstValueFrom(userObservable);
  }
}
