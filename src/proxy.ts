import { NextRequest, NextResponse } from "next/server";

// Fungsi proxy sederhana: cuma nerusin request apa adanya
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

// Batasi proxy hanya untuk route /admin kalau nanti mau dipakai
export const config = {
  matcher: ["/admin/:path*"],
};
