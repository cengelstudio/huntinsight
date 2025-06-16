import { NextResponse } from 'next/server';
import { addUser, getUsers } from '@/app/utils/storage';
import { User } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // Validate required fields
    if (!userData.name || !userData.surname || !userData.trnc_id || !userData.hunting_license) {
      return NextResponse.json(
        { message: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }

    // Create user with ID
    const user: User = {
      ...userData,
      id: uuidv4(),
    };

    // Save user
    addUser(user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Kullanıcılar alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
