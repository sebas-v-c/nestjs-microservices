import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth/auth.guard';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  USER_SERVICE_NAME,
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

  @UseGuards(AuthGuard)
  @Get()
  async getUserProfile(@Req() req) {
    const userId = req.user.userId as string;
    const userObservable = this.userService.getUserProfile({ userId });
    return await firstValueFrom(userObservable);
  }
}
