import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { User } from "../../types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, surname, trnc_id, hunting_license } = body;

    // Validate required fields
    if (!name || !surname || !trnc_id || !hunting_license) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    // Read existing users
    const usersPath = path.join(process.cwd(), "data", "users.json");
    const usersData = await fs.readFile(usersPath, "utf-8");
    const users: User[] = JSON.parse(usersData);

    // Check if user already exists
    const existingUser = users.find((u) => u.trnc_id === trnc_id);
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu K.K.T.C. Kimlik Numarası ile kayıtlı bir kullanıcı bulunmaktadır." },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      surname,
      trnc_id,
      hunting_license,
    };

    // Save user
    users.push(newUser);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    // Get available survey
    const surveysPath = path.join(process.cwd(), "data", "surveys.json");
    const surveysData = await fs.readFile(surveysPath, "utf-8");
    const surveys = JSON.parse(surveysData);

    // Get the first available survey
    const survey = surveys[0];
    if (!survey) {
      return NextResponse.json(
        { error: "Aktif anket bulunmamaktadır." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: newUser.id,
      surveyId: survey.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
