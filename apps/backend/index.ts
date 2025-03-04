import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions/v2';
import { AppModule } from './src/app.module';
import secrets from './src/secrets';

const createNestServer = async (): Promise<express.Express> => {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.setGlobalPrefix('api/v1');
  await app.init();
  return expressApp;
};

let server: express.Express | null = null;

export const api = functions.https.onRequest(
  { secrets },
  async (request, response) => {
    if (!server) {
      server = await createNestServer();
    }
    server(request, response);
  },
);
