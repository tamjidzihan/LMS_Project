// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  profile_picture?: string;
  date_joined: string;
}

// Authentication related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'student' | 'instructor';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course related types
export interface Course {
  id: string;
  title: string;
  short_description?: string;
  description: string;
  instructor: User;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_published: boolean;
  image?: string;
  average_rating: number;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
  duration: number;
  language?: string;
  has_preview: boolean;
  lessons?: Lesson[];
  reviews?: Review[];
  learning_objectives?: string[];
  requirements?: string[];
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  instructor?: string;
}

// Lesson related types
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  video_url?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  lesson_id: string;
  name: string;
  file_url: string;
  file_type: string;
}

// Enrollment related types
export interface Enrollment {
  id: string;
  user_id: string;
  course: Course;
  enrolled_at: string;
  progress: number;
  last_accessed_at?: string;
  completion_date?: string;
  is_certificate_issued: boolean;
}

export interface EnrollmentProgress {
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
}

// Review related types
export interface Review {
  id: string;
  course_id: string;
  user: {
    id: string;
    first_name: string;
    profile_picture?: string;
  };
  rating: number;
  comment: string;
  date: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

// Pagination related types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Notification preferences
export interface NotificationPreferences {
  email_notifications: boolean;
  course_updates: boolean;
  promotions: boolean;
}

// API Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}