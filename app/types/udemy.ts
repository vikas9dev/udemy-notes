export interface CaptionAsset {
  id: number;
  title: string;
  filename: string;
  locale_id: string;
  source: string;
  url: string;
}

export interface UdemyCourse {
  id: number;
  title: string;
  url: string;
  image_240x135: string;
  image_480x270: string;
  completion_ratio: number;
  num_collections: number;
  published_title: string;
  tracking_id: string;
}

export interface CurriculumItem {
  _class: string;
  id: number;
  title: string;
  object_index: number;
  is_completed: boolean;
  asset_type?: string;
  supplementary_assets?: unknown[];
  sort_order?: number;
  is_published?: boolean;
  asset?: {
    asset_type: string;
    length: number;
  };
}

export interface UdemyChapter {
  id: number;
  title: string;
  object_index: number;
  is_completed: boolean;
  children: UdemyLecture[];
}

export interface UdemyLecture {
  id: number;
  title: string;
  object_index: number;
}

export interface UdemyCurriculum {
  _class: string;
  id: number;
  title: string;
  chapters: UdemyChapter[];
}

export interface UdemyApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ChapterData {
  id: number;
  title: string;
  lectures: UdemyLecture[];
} 