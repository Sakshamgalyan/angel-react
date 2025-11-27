import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { User, UserResponse } from '@/types/user';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Get MongoDB database
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Update user terms acceptance
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          hasAcceptedTerms: true,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userResponse: UserResponse = {
      id: result._id!.toString(),
      email: result.email,
      name: result.name,
      hasAcceptedTerms: result.hasAcceptedTerms,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Terms update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
