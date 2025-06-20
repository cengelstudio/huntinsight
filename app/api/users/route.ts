import { NextResponse } from 'next/server';
import { addUser, getUsers, initializeStorage } from '@/app/utils/storage';
import { User } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    await initializeStorage();
    const userData = await request.json();

    // Validate required fields
    if (!userData.name || !userData.surname || !userData.trnc_id || !userData.hunting_license) {
      return NextResponse.json(
        { message: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }
    // Validate trnc_id: must be 10-11 digits and numeric only
    if (!/^\d{10,11}$/.test(userData.trnc_id)) {
      return NextResponse.json(
        { message: 'Kimlik numarası en az 10, en fazla 11 haneli ve sadece rakamlardan oluşmalıdır.' },
        { status: 400 }
      );
    }
    // Check for uniqueness by trnc_id and hunting_license for the same surveyId
    const users = await getUsers();
    const exists = users.some(u => u.trnc_id === userData.trnc_id && u.hunting_license === userData.hunting_license && u.surveyId === userData.surveyId);
    if (exists) {
      return NextResponse.json(
        { message: 'Bu kimlik ve ruhsat numarası ile bu ankete zaten katıldınız.' },
        { status: 400 }
      );
    }

    // Create user with ID
    const user: User = {
      ...userData,
      id: uuidv4(),
      surveyId: userData.surveyId,
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
    await initializeStorage();
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
