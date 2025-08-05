import { bot } from "@/bot";
import { createExpenseMessageTemplate } from "@/bot/templates";
import { transactionRepository } from "@/repositories/transaction-repository";
import { userRepository } from "@/repositories/user-repository";
import { monobankService } from "@/services/monobank-service";
import { signJwt } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Markup } from "telegraf";

const appUrl = process.env.APP_URL

// To handle a POST request to /api
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
    const shouldIgnoreTransaction = monobankService.shouldIgnoreTransaction(body.data.statementItem)
    if (shouldIgnoreTransaction) {
      return NextResponse.json({ success: true }, { status: 200 })
    }
    const user = await userRepository.getUserByAccountId(body.data.account)
    if (user) {
      const token = await signJwt({ id: user.id })
      const result = await transactionRepository.createTransaction(user.id, body.data.statementItem)
      await bot.telegram.sendMessage(user.chat_id, createExpenseMessageTemplate(body.data.statementItem), {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([Markup.button.webApp("Отметить категории", `${appUrl}/transaction/${result.id}?token=${token}`)])
      });
      console.log(`New transaction for user ${user.id} data: ${JSON.stringify(body)}`)
    }
  } catch (error) {
    console.log(`ERROR while processing new transaction: ${error} \n request: ${JSON.stringify(body)}`)
  } finally {
    return NextResponse.json({ success: true }, { status: 200 });
  }

}
