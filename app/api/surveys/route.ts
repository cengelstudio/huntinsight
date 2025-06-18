import { NextResponse } from 'next/server';
import { getSurveys, writeSurveys, initializeStorage } from '@/app/utils/storage';
import { Survey } from '@/app/types';
import path from 'path';
import fs from "fs/promises";

// Get all surveys
export async function GET() {
  try {
    await initializeStorage();
    const surveys = await getSurveys();
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error reading surveys:', error);
    return NextResponse.json(
      { error: 'Failed to read surveys' },
      { status: 500 }
    );
  }
}

// Create a new survey
export async function POST(request: Request) {
  try {
    await initializeStorage();
    const survey: Survey = await request.json();

    // Validate survey data
    if (!survey.title || !survey.description || !survey.questions?.length) {
      return NextResponse.json(
        { error: 'Invalid survey data' },
        { status: 400 }
      );
    }

    const surveys = await getSurveys();
    const existingSurveyIndex = surveys.findIndex(s => s.id === survey.id);

    if (existingSurveyIndex >= 0) {
      surveys[existingSurveyIndex] = survey;
    } else {
      surveys.push(survey);
    }

    await writeSurveys(surveys);
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error saving survey:', error);
    return NextResponse.json(
      { error: 'Failed to save survey' },
      { status: 500 }
    );
  }
}

// Update a survey
export async function PUT(request: Request) {
  try {
    await initializeStorage();
    const survey: Survey = await request.json();

    // Validate survey data
    if (!survey.id || !survey.title || !survey.questions || !Array.isArray(survey.questions)) {
      return NextResponse.json(
        { error: 'Geçersiz anket formatı.' },
        { status: 400 }
      );
    }

    // Read existing surveys
    const surveysPath = path.join(process.cwd(), 'data', 'surveys.json');
    const surveysData = await fs.readFile(surveysPath, 'utf-8');
    const surveys: Survey[] = JSON.parse(surveysData);

    // Find and update the survey
    const surveyIndex = surveys.findIndex((s) => s.id === survey.id);
    if (surveyIndex === -1) {
      return NextResponse.json(
        { error: 'Anket bulunamadı.' },
        { status: 404 }
      );
    }

    // Update survey
    surveys[surveyIndex] = survey;
    await fs.writeFile(surveysPath, JSON.stringify(surveys, null, 2));

    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Anket güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Delete a survey
export async function DELETE(request: Request) {
  try {
    await initializeStorage();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const surveys = await getSurveys();
    const filteredSurveys = surveys.filter(survey => survey.id !== id);

    if (filteredSurveys.length === surveys.length) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    await writeSurveys(filteredSurveys);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    );
  }
}
