import { NextResponse } from 'next/server';
import { getSurveys } from '@/app/utils/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const surveys = await getSurveys();
    const survey = surveys[0]; // For now, we're using the first survey

    if (params.id === 'first') {
      // Return the first question
      return NextResponse.json(survey.questions[0]);
    }

    // Find the specific question
    const question = survey.questions.find(q => q.id === params.id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}
