import { bot } from "@/bot";
import { NextResponse } from "next/server";

const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

export async function POST() {

  if (!webhookUrl) {
    return
  }

  const existingWebhookUrl = (await bot.telegram.getWebhookInfo()).url

  if (existingWebhookUrl) {
    await bot.telegram.deleteWebhook()
  }

  const res = await bot.telegram.setWebhook(webhookUrl)
  if (res) {
    return NextResponse.json({ message: "Webhook set on url " + webhookUrl }, { status: 200 });
  }

  return NextResponse.error()
}
