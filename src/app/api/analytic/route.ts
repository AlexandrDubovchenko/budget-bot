import { getAnalytic } from "@/services/anayltic-service";
import { verifyJwt } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');
  const fromTimestamp = request.nextUrl.searchParams.get('from');
  const toTimestamp = request.nextUrl.searchParams.get('to');
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await verifyJwt<{ id: number }>(token);
  if (!user) {
    return new NextResponse('Unauthorized', {
      status
        : 401
    });
  }

  const { analytic, notMarkedTransactions } = await getAnalytic(user.id, Number(fromTimestamp), Number(toTimestamp));

  return NextResponse.json({ analytic, notMarkedTransactions })
}
