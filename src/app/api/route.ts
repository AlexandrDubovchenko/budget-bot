import { bot } from "@/bot";
import { createExpenseMessageTemplate } from "@/bot/templates";
import { transactionRepository } from "@/repositories/transaction-repository";
import { userRepository } from "@/repositories/user-repository";
import { signJwt } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Markup } from "telegraf";

const appUrl = process.env.APP_URL

// To handle a POST request to /api
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await userRepository.getUserByAccountId(body.data.account)
  const token = signJwt({ id: user.id })
  if (user) {
    const result = await transactionRepository.createTransaction(user.id, body.data.statementItem)
    bot.telegram.sendMessage(user.chat_id, createExpenseMessageTemplate(body.data.statementItem), Markup.inlineKeyboard([Markup.button.webApp("Launch", `${appUrl}/transaction/${result.id}?token=${token}`)]));
  }
  // Do whatever you want
  return NextResponse.json({ success: true }, { status: 200 });
}
