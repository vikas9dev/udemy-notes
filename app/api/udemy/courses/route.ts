import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cookie, page = 1, search = '', sort = '-last_accessed' } = await request.json();

    if (!cookie) {
      return NextResponse.json(
        { error: 'Cookie is required' },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: '50',
      ordering: sort,
      'fields[course]': 'completion_ratio,image_240x135,image_480x270,num_collections,published_title,title,tracking_id,url',
    });

    if (search) {
      queryParams.set('search', search);
    }

    const response = await fetch(
      `https://www.udemy.com/api-2.0/users/me/subscribed-courses/?${queryParams}`,
      {
        headers: {
          Cookie: cookie,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Invalid cookie' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/udemy/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 