import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Joi from 'joi';
import { MiddlewareConfig } from '@line/bot-sdk';

interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const filePath = path.resolve(process.cwd(), '.env');
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  get NODE_ENV() {
    return this.envConfig.NODE_ENV;
  }

  get PORT(): number {
    return Number(this.envConfig.PORT);
  }

  get DATABASE_URL(): string {
    return process.env.NODE_ENV === 'test'
      ? this.envConfig.DATABASE_URL_TEST
      : this.envConfig.DATABASE_URL;
  }

  get LINE_CONFIG(): MiddlewareConfig {
    const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET } = this.envConfig;
    return {
      channelAccessToken: CHANNEL_ACCESS_TOKEN,
      channelSecret: CHANNEL_SECRET,
    };
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test'])
        .default('development'),
      PORT: Joi.number().default(3000),
      DATABASE_URL: Joi.string().required(),
      DATABASE_URL_TEST:
        process.env.NODE_ENV === 'test'
          ? Joi.string().required()
          : Joi.string().optional(),

      CHANNEL_ACCESS_TOKEN: Joi.string().required(),
      CHANNEL_SECRET: Joi.string().required(),
    });

    const { error, value } = Joi.validate(envConfig, envVarSchema);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return value;
  }
}
