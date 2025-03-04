import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  IsArray,
  IsUrl,
  ArrayNotEmpty,
  ArrayMaxSize,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';
import axios from 'axios';
import { secretsMap } from './secrets';

class ComplaintDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  urls: string[];

  @IsOptional()
  @MaxLength(500)
  description?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('claim')
  async submitClaim(@Body() body: any) {
    const complaintDto = plainToInstance(ComplaintDto, body);
    let message = `New complaint received:\n` + complaintDto.urls.join('\n');

    if (complaintDto.description) {
      message += `\n\nDescription: ${complaintDto.description}`;
    }

    await axios.post(
      `https://api.telegram.org/bot${secretsMap.telegramBotToken.value()}/sendMessage`,
      {
        chat_id: secretsMap.telegramChatID.value(),
        text: message,
      },
    );

    return { success: true, message: 'claim_accepted' };
  }
}
