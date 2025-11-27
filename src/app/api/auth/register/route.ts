import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import type { User, UserResponse } from "@/types/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body?.email ?? "").toString().toLowerCase().trim();
    const password = (body?.password ?? "").toString();
    const name = (body?.name ?? "").toString().trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Quick email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Password strength check
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Get MongoDB database
    const db = await getDatabase();
    const usersCollection = db.collection<User>("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: Omit<User, '_id'> = {
      email,
      password: hashedPassword,
      name,
      hasAcceptedTerms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as User);

    // Return user without password
    const userResponse: UserResponse = {
      id: result.insertedId.toString(),
      email,
      name,
      hasAcceptedTerms: false,
    };

    // Create response with user data
    const response = NextResponse.json({ user: userResponse }, { status: 201 });

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', result.insertedId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        hint: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
