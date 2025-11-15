import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const authGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(__dirname, '../../../proto/auth.proto'),
    url: process.env.GRPC_AUTH_URL || 'localhost:50051',
  },
};

export const videoGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'video',
    protoPath: join(__dirname, '../../../proto/video.proto'),
    url: process.env.GRPC_VIDEO_URL || 'localhost:50052',
  },
};

export const interactionGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'interaction',
    protoPath: join(__dirname, '../../../proto/interaction.proto'),
    url: process.env.GRPC_INTERACTION_URL || 'localhost:50053',
  },
};

export const notificationGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'notification',
    protoPath: join(__dirname, '../../../proto/notification.proto'),
    url: process.env.GRPC_NOTIFICATION_URL || 'localhost:50054',
  },
};
