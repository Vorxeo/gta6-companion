import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { billingOperational, syncPayment } from "@/lib/billing/server";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  if (!billingOperational()) return new NextResponse(null, { status: 503 });
  const actual = Buffer.from(request.nextUrl.searchParams.get("token") || "");
  const expected = Buffer.from(process.env.MOLLIE_WEBHOOK_SECRET!);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return new NextResponse(null, { status: 401 });
  if (Number(request.headers.get("content-length") || "0") > 4096) return new NextResponse(null, { status: 413 });
  try {
    const form = await request.formData();
    const paymentId = form.get("id");
    if (typeof paymentId !== "string" || !/^tr_[a-zA-Z0-9]+$/.test(paymentId)) return new NextResponse(null, { status: 400 });
    await syncPayment(paymentId);
    return NextResponse.json({ ok: true });
  } catch { return new NextResponse(null, { status: 503 }); }
}
