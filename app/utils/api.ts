import { UdemyCourse, UdemyCurriculum, UdemyApiResponse } from '../types/udemy';

const UDEMY_BASE_URL = 'https://www.udemy.com/api-2.0';

export async function fetchCourses(cookie: string): Promise<UdemyApiResponse<UdemyCourse>> {
  const response = await fetch(`${UDEMY_BASE_URL}/users/me/subscribed-courses`, {
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCurriculum(courseId: number, cookie: string): Promise<UdemyCurriculum> {
  const response = await fetch(
    `${UDEMY_BASE_URL}/courses/${courseId}/subscriber-curriculum-items?page_size=1400&fields[lecture]=title,object_index,is_completed,asset,supplementary_assets,sort_order,is_published&fields[quiz]=title,object_index,is_completed,type&fields[practice]=title,object_index,is_completed&fields[chapter]=title,object_index,is_completed&fields[asset]=asset_type,length`,
    {
      headers: {
        'Cookie': cookie,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch curriculum: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCourseInfo(courseId: number, cookie: string): Promise<UdemyCourse> {
  const response = await fetch(`${UDEMY_BASE_URL}/courses/${courseId}`, {
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch course info: ${response.statusText}`);
  }

  return response.json();
} 