import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Survey } from "../../../types";

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
