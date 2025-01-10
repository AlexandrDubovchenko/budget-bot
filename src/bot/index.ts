import { chatRepository } from "@/repositories/chat-repository";
import { userRepository } from "@/repositories/user-repository";
import { monobankService } from "@/services/monobank-service";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

const token = process.env.TELEGRAM_BOT_TOKEN ?? ''
export const bot = new Telegraf(token);

bot.command('start', async (ctx) => {
  console.log("Bot start command");
  const chatId = ctx.chat.id;
  const existingChat = await chatRepository.getChatById(chatId);
  if (!existingChat) {
    try {
      await chatRepository.createChat(chatId, 'REGISTRATION');
      ctx.reply('Введите монобанк апи ключ')
    } catch {
      console.error('ERROR: bot/index.ts');
    }
  } else {
    await chatRepository.updateStatus(chatId, 'WAIT_COMMAND')
  }
})

bot.on(message("text"), async ctx => {
  const chatId = ctx.chat.id
  const message = ctx.message
  const apiKey = message.text
  const chat = await chatRepository.getChatById(chatId)
  console.log("Message in bot ", message);
  
  if (chat?.status === 'REGISTRATION') {
    await ctx.sendMessage(`Получаем данные пользователя...`);
    try {
      const accountIds = await monobankService.getUserAccounts(apiKey)
      await monobankService.subscribeUserForUpdates(apiKey)
      await userRepository.createUser(apiKey, chat.id, accountIds)
      await ctx.sendMessage('Регистрация завершена успешно');
      await chatRepository.updateStatus(chat.id, 'WAIT_COMMAND')
      
    } catch (error) {
      console.log(error);
      await ctx.sendMessage(`Возникла ошибка`);
      await ctx.sendMessage(`Введите ключ повторно.`);
    }
  }
});
