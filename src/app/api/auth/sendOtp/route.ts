import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Verification } from '@/types/user';

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    if (!mobile || mobile.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid mobile number' },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const db = await getDatabase();
    
    await db.collection<Verification>('verification').updateOne(
      { mobile },
      { $set: { otp, expiresAt } },
      { upsert: true }
    );

    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (apiKey) {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: mobile,
        }),
      });

      const data = await response.json();
      
      if (!data.return) {
        console.error('Fast2SMS Error:', data);
        return NextResponse.json(
             { error: 'Failed to send OTP via SMS provider' },
             { status: 500 }
        );
      }
    } else {
      // Development mode or missing key
      console.log('--------------------------------');
      console.log(`[DEV MODE] OTP for ${mobile}: ${otp}`);
      console.log('--------------------------------');
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
