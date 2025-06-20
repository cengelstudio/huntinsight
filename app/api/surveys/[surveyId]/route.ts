import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Survey, Response } from "../../../types";

export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const surveysPath = path.join(process.cwd(), "data", "surveys.json");
    const surveysData = await fs.readFile(surveysPath, "utf-8");
    const surveys: Survey[] = JSON.parse(surveysData);

    const survey = surveys.find((s) => s.id === params.surveyId);

    if (!survey) {
      return NextResponse.json(
        { error: "Anket bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { error: "Anket yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const updatedSurvey: Survey = await request.json();

    // Check if there are any responses for this survey
    const responsesPath = path.join(process.cwd(), "data", "responses.json");
    try {
      const responsesData = await fs.readFile(responsesPath, "utf-8");
      const responses: Response[] = JSON.parse(responsesData);

      const surveyHasResponses = responses.some(response => response.surveyId === params.surveyId);

      if (surveyHasResponses) {
        return NextResponse.json(
          {
            error: "Bu ankete zaten yanıtlar verilmiş. Yanıt alınan anketler düzenlenemez.",
            hasResponses: true
          },
          { status: 400 }
        );
      }
    } catch (responseError) {
      // If responses file doesn't exist, continue with update
      console.log("No responses file found, proceeding with update");
    }

    // Update survey
    const surveysPath = path.join(process.cwd(), "data", "surveys.json");
    const surveysData = await fs.readFile(surveysPath, "utf-8");
    const surveys: Survey[] = JSON.parse(surveysData);

    const surveyIndex = surveys.findIndex((s) => s.id === params.surveyId);

    if (surveyIndex === -1) {
      return NextResponse.json(
        { error: "Anket bulunamadı." },
        { status: 404 }
      );
    }

    // Update the survey while preserving the original creation date
    surveys[surveyIndex] = {
      ...updatedSurvey,
      id: params.surveyId,
      createdAt: surveys[surveyIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(surveysPath, JSON.stringify(surveys, null, 2));

    return NextResponse.json(surveys[surveyIndex]);
  } catch (error) {
    console.error("Error updating survey:", error);
    return NextResponse.json(
      { error: "Anket güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
