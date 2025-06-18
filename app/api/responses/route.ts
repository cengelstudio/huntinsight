import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Response } from '@/app/types';
import { initializeStorage } from '@/app/utils/storage';

export async function GET() {
  try {
    await initializeStorage();
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
    await initializeStorage();
    const body = await request.json();
    console.log('Received request body:', body);
    const { surveyId, userId, answers, name, surname } = body;

    // Validate required fields
    if (!surveyId || !userId || !answers || !Array.isArray(answers) || !name || !surname) {
      console.log('Validation failed:', {
        surveyId: !!surveyId,
        userId: !!userId,
        answers: !!answers,
        isArray: Array.isArray(answers),
        name: !!name,
        surname: !!surname
      });
      return NextResponse.json(
        { error: 'Geçersiz veri formatı. Lütfen tüm alanları doldurun.' },
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
      name,
      surname,
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
