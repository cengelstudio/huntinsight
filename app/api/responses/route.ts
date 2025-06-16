import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Response } from '@/app/types';

export async function GET() {
  try {
    const responsesPath = path.join(process.cwd(), 'data', 'responses.json');
    const responsesData = await fs.readFile(responsesPath, 'utf-8');
    const responses: Response[] = JSON.parse(responsesData);
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error reading responses:', error);
    return NextResponse.json(
      { error: 'Yanıtlar yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { surveyId, userId, answers, userName, userSurname } = body;

    // Validate required fields
    if (!surveyId || !userId || !answers || !Array.isArray(answers) || !userName || !userSurname) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı.' },
        { status: 400 }
      );
    }

    // Read existing responses
    const responsesPath = path.join(process.cwd(), 'data', 'responses.json');
    let responses: Response[] = [];
    try {
      const responsesData = await fs.readFile(responsesPath, 'utf-8');
      responses = JSON.parse(responsesData);
    } catch {
      // If file doesn't exist or is empty, start with empty array
      console.log('No existing responses file, starting fresh');
    }

    // Check if user has already submitted this survey
    const existingResponse = responses.find(
      (r) => r.surveyId === surveyId && r.userId === userId
    );

    if (existingResponse) {
      return NextResponse.json(
        { error: 'Bu anketi daha önce doldurdunuz.' },
        { status: 400 }
      );
    }

    // Create new response
    const newResponse: Response = {
      id: crypto.randomUUID(),
      surveyId,
      userId,
      userName,
      userSurname,
      answers,
      completedAt: new Date().toISOString()
    };

    // Save response
    responses.push(newResponse);
    await fs.writeFile(responsesPath, JSON.stringify(responses, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Response submission error:', error);
    return NextResponse.json(
      { error: 'Cevaplar kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
