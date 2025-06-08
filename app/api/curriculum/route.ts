import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { courseId, cookie } = await request.json();

    if (!courseId || !cookie) {
      return NextResponse.json(
        { error: 'Course ID and cookie are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://www.udemy.com/api-2.0/courses/${courseId}/subscriber-curriculum-items?curriculum_types=chapter,lecture&page_size=1000&fields[lecture]=title,object_index&fields[chapter]=title,object_index`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch curriculum' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 