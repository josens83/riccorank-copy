// Form Data Types

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  category: string;
  tags?: string;
  stockId?: string;
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}

export interface ReportFormData {
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
  description?: string;
}
