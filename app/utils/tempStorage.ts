interface NoteFile {
  chapter: string;
  lecture: string;
  content: string;
}

interface NotesData {
  courseTitle: string;
  notes: NoteFile[];
}

// In-memory storage for generated notes
const notesStorage = new Map<string, NotesData>();

export function storeNotes(key: string, courseTitle: string, notes: NoteFile[]) {
  notesStorage.set(key, { courseTitle, notes });
  
  // Set a timeout to clean up after 5 minutes
  setTimeout(() => {
    notesStorage.delete(key);
  }, 5 * 60 * 1000);
}

export function getNotes(key: string): NotesData | undefined {
  return notesStorage.get(key);
}

export function generateStorageKey(courseId: string, timestamp: string): string {
  return `${courseId}-${timestamp}`;
} 