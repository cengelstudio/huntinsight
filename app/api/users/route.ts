import { NextResponse } from 'next/server';
import { addUser } from '@/app/utils/storage';
import { User } from '@/app/types';

export async function POST(request: Request) {
  try {
    const user: User = await request.json();
    addUser(user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getUsers } = await import('@/app/utils/storage');
    const users = getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
