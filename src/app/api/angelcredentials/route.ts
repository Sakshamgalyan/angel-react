import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/types/user';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth-token');

        if (!authToken || !authToken.value || !ObjectId.isValid(authToken.value)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { angelClientCode, angelApiKey, angelTOTPKey, angelPassword } = body;

        // Basic validation
        if (!angelClientCode || !angelApiKey || !angelTOTPKey || !angelPassword) {
             return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');
        const userId = new ObjectId(authToken.value);

        const updateResult = await usersCollection.updateOne(
            { _id: userId },
            {
                $set: {
                    angelClientCode,
                    angelApiKey,
                    angelTOTPKey,
                    angelPassword,
                    updatedAt: new Date(),
                },
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Credentials saved successfully' });

    } catch (error) {
        console.error('Error saving credentials:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
