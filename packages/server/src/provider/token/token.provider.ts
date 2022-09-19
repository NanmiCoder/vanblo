import { Injectable, Logger } from '@nestjs/common';

import { TokenDocument } from 'src/scheme/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenProvider {
  logger = new Logger(TokenProvider.name);
  timer = null;
  constructor(
    @InjectModel('Token') private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(payload: any) {
    this.logger.debug(`用户 ${payload.username} 登录，创建 Token。`);
    const token = this.jwtService.sign(payload);
    this.tokenModel.create({ userId: payload.sub, token });
    return token;
  }
  async disableToken(token: string) {
    return await this.tokenModel.updateOne({ token }, { disabled: true });
  }
  async disableAll() {
    return await this.tokenModel.updateMany(
      { disabled: false },
      { disabled: true },
    );
  }
  async disableAllAdmin() {
    return await this.tokenModel.updateMany(
      { disabled: false, userId: 0 },
      { disabled: true },
    );
  }
  async disableAllCollaborator() {
    return await this.tokenModel.updateMany(
      { disabled: false, userId: { $ne: 0 } },
      { disabled: true },
    );
  }
  async disableByUserId(id: number) {
    return await this.tokenModel.updateMany(
      { disabled: false, userId: id },
      { disabled: true },
    );
  }
  async checkToken(token: string) {
    const result = await this.tokenModel.findOne({ token, disabled: false });
    if (!result) {
      return false;
    }
    return true;
  }
}
