import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
        { mobile: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      hasAcceptedTerms: user.hasAcceptedTerms
    };

    const response = NextResponse.json({ 
        user: userResponse,
        success: true, 
    });

    // Set auth cookie
    response.cookies.set('auth-token', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}