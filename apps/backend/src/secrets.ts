import { defineSecret } from 'firebase-functions/params';

export const secretsMap = {
  telegramBotToken: defineSecret('TELEGRAM_BOT_TOKEN'),
  telegramChatID: defineSecret('TELEGRAM_CLAIM_CHAT_ID'),
};

export default Object.values(secretsMap);
