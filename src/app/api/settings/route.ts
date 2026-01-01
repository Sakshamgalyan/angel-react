import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User, UserResponse } from '@/types/user';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth-token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const user = await db.collection<User>('users').findOne({ _id: new ObjectId(authToken.value) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userResponse: Partial<User> = {
            name: user.name,
            email: user.email,
            username: user.username,
            mobile: user.mobile,
        };

        return NextResponse.json({ user: userResponse });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth-token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, username, password } = body;

        if (!name || !email || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');
        const userId = new ObjectId(authToken.value);

        // Check if email or username is taken by another user
        const existingUser = await usersCollection.findOne({
            $and: [
                { _id: { $ne: userId } },
                { $or: [{ email }, { username }] }
            ]
        });

        if (existingUser) {
             let field = "User";
             if (existingUser.email === email) field = "Email";
             if (existingUser.username === username) field = "Username";
             return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
        }

        const updateData: any = {
            name,
            email,
            username,
            updatedAt: new Date()
        };

        if (password && password.trim() !== '') {
            if (password.length < 8) {
                return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        await usersCollection.updateOne(
            { _id: userId },
            { $set: updateData }
        );

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });

    } catch (error: any) {
        console.error('Settings PUT error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
