import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import type { User, UserResponse, Verification } from "@/types/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body?.email ?? "").toString().toLowerCase().trim();
    const password = (body?.password ?? "").toString();
    const username = (body?.username ?? "").toString().trim();
    const mobile = (body?.mobile ?? "").toString().trim();
    const verificationToken = (body?.verificationToken ?? "").toString().trim();

    if (!email || !password || !username || !mobile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Quick validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(mobile)) {
        return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    // Get MongoDB database
    const db = await getDatabase();
    
    if (verificationToken) {
        const verification = await db.collection<Verification> ('verification').findOne({ 
            token: verificationToken,
            mobile: mobile,
            expiresAt: { $gt: new Date() }
        });
        
        if (!verification) {
            return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
        }
        
        await db.collection<Verification>('verification').deleteOne({ token: verificationToken });
    } else {
         return NextResponse.json({ error: "Mobile verification required" }, { status: 400 });
    }

    const usersCollection = db.collection<User>("users");

    const existingUser = await usersCollection.findOne({ 
        $or: [{ email }, { mobile }, { username }] 
    });
    
    if (existingUser) {
        let field = "User";
        if (existingUser.email === email) field = "Email";
        if (existingUser.mobile === mobile) field = "Mobile";
        if (existingUser.username === username) field = "Username";
      return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: any = {
      email,
      username,
      mobile,
      password: hashedPassword,
      name: username,
      role: "merchant",
      hasAcceptedTerms: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as User);

    // Return user without password
    const userResponse: UserResponse = {
      id: result.insertedId.toString(),
      email,
      name: username,
      role: "merchant",
      hasAcceptedTerms: false,
    };

    // Create response with user data
    const response = NextResponse.json({ user: userResponse, success: true }, { status: 201 });

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
