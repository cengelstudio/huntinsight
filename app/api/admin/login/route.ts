import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/app/utils/storage';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const isValid = verifyAdminPassword(password);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
