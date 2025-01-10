import { bot } from "@/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  bot.handleUpdate(body);
  return NextResponse.json({ message: "ok" }, { status: 200 });
}
