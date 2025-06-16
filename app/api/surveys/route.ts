import { NextResponse } from 'next/server';
import { addSurvey, getSurveys, updateSurvey } from '@/app/utils/storage';
import { Survey } from '@/app/types';

export async function POST(request: Request) {
  try {
    const survey: Survey = await request.json();
    addSurvey(survey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const surveys = getSurveys();
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const survey: Survey = await request.json();
    updateSurvey(survey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    );
  }
}
