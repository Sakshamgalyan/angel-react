// app/api/auth/register/route.ts  (or wherever your route is)
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body?.email ?? "").toString().toLowerCase().trim();
    const password = (body?.password ?? "").toString();
    const name = (body?.name ?? "").toString().trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // quick email format check (very small footprint)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // ensure Prisma connected (harmless if already connected)
    try {
      await db.$connect();
    } catch (e) {
      console.warn("Prisma connect warning:", e);
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // use select to avoid returning columns with mismatched types
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        hasAcceptedTerms: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    // improved logging to help track the 22P03 issue
    console.error("Registration error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });

    // don't leak internals to client, but include small hint for dev
    return NextResponse.json(
      {
        error: "Internal server error",
        hint: error?.code ? `${error.code}` : undefined,
      },
      { status: 500 }
    );
  }
}
