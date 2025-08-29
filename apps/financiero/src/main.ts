import { NestFactory } from '@nestjs/core';
import { FinancieroModule } from './financiero.module';
import { ServerCredentials } from '@grpc/grpc-js';
import { readFileSync } from 'fs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FINANCIERO_PACKAGE_NAME } from '@app/proto-types/financiero';
import { Logger } from '@nestjs/common';

function read(f: string) {
  return readFileSync(f);
}

async function bootstrap() {
  const serverCreds = ServerCredentials.createSsl(
    read('./certs/ca.crt'),
    [
      {
        private_key: read('./certs/server.key'),
        cert_chain: read('./certs/server.crt'),
      },
    ],
    true,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FinancieroModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:3003',
        package: FINANCIERO_PACKAGE_NAME,
        protoPath: './proto/financiero.proto',
        credentials: serverCreds,
        // this is required to keep the case of the keys in the response
        loader: {
          keepCase: true,
        },
      },
    },
  );

  await app.listen();
  Logger.log('Financiero Service is running GRPC...');
}

bootstrap();
