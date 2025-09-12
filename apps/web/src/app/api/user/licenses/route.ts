import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from session/auth
    // For now, we'll use a mock user ID or get from query params
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user and their licenses
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        licenses: {
          include: {
            activations: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format licenses for the frontend
    const formattedLicenses = user.licenses.map(license => ({
      id: license.id,
      key: license.key,
      plan: license.plan,
      status: license.status,
      createdAt: license.createdAt.toISOString(),
      activations: license.activations.length,
      maxSeats: 1, // Fixed at 1 for now
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      licenses: formattedLicenses,
    });
    
  } catch (error) {
    console.error('Error fetching user licenses:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
