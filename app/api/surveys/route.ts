import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Survey } from '@/app/types';

const dataDirectory = path.join(process.cwd(), 'data');
const surveysFile = path.join(dataDirectory, 'surveys.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.access(dataDirectory);
  } catch {
    await fs.mkdir(dataDirectory, { recursive: true });
  }
}

// Read surveys from file
async function readSurveys(): Promise<Survey[]> {
  try {
    const data = await fs.readFile(surveysFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write surveys to file
async function writeSurveys(surveys: Survey[]) {
  await fs.writeFile(surveysFile, JSON.stringify(surveys, null, 2));
}

// Get all surveys
export async function GET() {
  try {
    await ensureDataDirectory();
    const surveys = await readSurveys();
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
    const survey: Survey = await request.json();

    // Validate survey data
    if (!survey.title || !survey.description || !survey.questions?.length) {
      return NextResponse.json(
        { error: 'Invalid survey data' },
        { status: 400 }
      );
    }

    await ensureDataDirectory();
    const surveys = await readSurveys();

    // Check if survey with same ID exists
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    await ensureDataDirectory();
    const surveys = await readSurveys();
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
