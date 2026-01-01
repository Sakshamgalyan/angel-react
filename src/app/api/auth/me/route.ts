import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { User, UserResponse } from '@/types/user';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken || !authToken.value) {
      return NextResponse.json({ user: null });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(authToken.value)) {
      return NextResponse.json({ user: null });
    }

    // Get user from database
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(authToken.value) });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const userResponse: UserResponse = {
      id: user._id!.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      angelApiKey: user.angelApiKey,
      angelClientCode: user.angelClientCode,
      angelPassword: user.angelPassword,
      angelTOTPKey: user.angelTOTPKey,
      isLocked: user.isLocked,
      hasAcceptedTerms: user.hasAcceptedTerms,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
