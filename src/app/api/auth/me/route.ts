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
      email: user.email,
      name: user.name,
      hasAcceptedTerms: user.hasAcceptedTerms,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
