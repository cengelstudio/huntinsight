import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Read admin configuration
    const adminPath = path.join(process.cwd(), 'data', 'admin.json');
    const adminData = await fs.readFile(adminPath, 'utf-8');
    const { hashedPassword } = JSON.parse(adminData);

    // Hash the provided password
    const hash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (hash !== hashedPassword) {
      return NextResponse.json(
        { error: 'Geçersiz şifre.' },
        { status: 401 }
      );
    }

    // Generate a session token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      token,
      message: 'Giriş başarılı.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
