import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cookie } = await request.json();

    if (!cookie) {
      return NextResponse.json(
        { error: 'Cookie is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      'https://www.udemy.com/api-2.0/users/me/subscribed-courses/?ordering=-last_accessed&fields[course]=completion_ratio,image_240x135,image_480x270,num_collections,published_title,title,tracking_id,url',
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 