import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Tenant } from '@core/entities';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}