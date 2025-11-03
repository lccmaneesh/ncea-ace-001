export enum Subject {
  English = 'English',
  Mathematics = 'Mathematics',
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export enum QuestionType {
  Written = 'written',
  Numeric = 'numeric',
}

export interface Question {
  questionText: string;
  questionType: QuestionType;
  imageData?: string; // Base64 image data
}

export interface Feedback {
  wellDone: string;
  toImprove: string;
}

export interface MathFeedback {
    isCorrect: boolean;
    explanation: string;
}

export interface SessionData {
  question: Question;
  answer: string;
  feedback: Feedback | MathFeedback;
}

export interface Report {
  id: string;
  subject: Subject;
  topicName: string;
  date: string;
  sessionData: SessionData[];
}

// Types for Adaptive Learning
export interface TopicProgress {
  topicId: string;
  proficiency: number; // A score from 0.0 to 1.0
  areasForImprovement: string[];
  history: {
    date: string;
    score: number;
  }[];
}

export interface UserProfile {
  [topicId: string]: TopicProgress;
}
