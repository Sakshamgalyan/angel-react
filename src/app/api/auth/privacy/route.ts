import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { accepted } = body;

        if (typeof accepted !== 'boolean') {
            return NextResponse.json(
                { success: false, message: 'Invalid request' },
                { status: 400 }
            );
        }

        // Update user's privacy acceptance
        const user = await prisma.user.update({
            where: { id: payload.userId },
            data: { privacyAccepted: accepted },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Privacy preference updated',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    privacyAccepted: user.privacyAccepted,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Privacy acceptance error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
