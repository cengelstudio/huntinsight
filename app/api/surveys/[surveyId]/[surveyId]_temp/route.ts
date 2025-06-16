import { NextResponse } from 'next/server';
import { updateSurvey } from '@/app/utils/storage';

export async function PUT(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const survey = await request.json();
    if (survey.id !== params.surveyId) {
      return NextResponse.json(
        { error: 'Survey ID mismatch' },
        { status: 400 }
      );
    }

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
