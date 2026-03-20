import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      return NextResponse.json({ error: "No password configured" }, { status: 500 });
    }

    if (password !== sitePassword) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    response.cookies.set("cp-auth", password, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
