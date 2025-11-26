import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { hasAcceptedTerms: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasAcceptedTerms: user.hasAcceptedTerms,
      },
    });
  } catch (error) {
    console.error('Terms update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
