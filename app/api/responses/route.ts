import { NextResponse } from 'next/server';
import { addResponse, getResponses } from '@/app/utils/storage';
import { UserResponse } from '@/app/types';

export async function POST(request: Request) {
  try {
    const response: UserResponse = await request.json();
    addResponse(response);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = getResponses();
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
