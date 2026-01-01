import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { mobile, otp, type } = await req.json(); 

    if (!mobile || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // 1. Verify OTP
    const record = await db.collection('verification').findOne({ mobile });

    if (!record) {
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid. Delete it.
    await db.collection('verification').deleteOne({ mobile });

    // 2. Handle Logic based on Type
    if (type === 'LOGIN') {
        // Authenticate User immediately
        const user = await db.collection('users').findOne({ mobile });
        if (!user) {
             return NextResponse.json(
                { error: 'User not found for this mobile number' },
                { status: 404 }
             );
        }

        const response = NextResponse.json({ 
            success: true, 
            message: 'Login successful'
        });

        // Set Auth Cookie
        response.cookies.set('auth-token', user._id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return response;

    } else {
        // SIGNUP: Return verification token for next step (register)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        await db.collection('verifications').insertOne({
            mobile,
            token: verificationToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        return NextResponse.json({ 
            success: true, 
            message: 'OTP verified successfully',
            verificationToken 
        });
    }

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
