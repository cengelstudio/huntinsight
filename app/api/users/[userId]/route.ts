import { NextResponse } from 'next/server';
import { getUsers } from '@/app/utils/storage';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === params.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
