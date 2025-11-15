import { Module } from '@nestjs/common';
import { InteractionController } from './interaction.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [InteractionController],
})
export class InteractionModule {}
