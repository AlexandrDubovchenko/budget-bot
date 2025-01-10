import { bot } from "@/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('New telegram request ', JSON.stringify(body))
  bot.handleUpdate(body);
  return NextResponse.json({ message: "ok" }, { status: 200 });
}
