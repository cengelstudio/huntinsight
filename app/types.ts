export type QuestionOption = string;

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  branching?: Record<string, string>;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface User {
  id: string;
  name: string;
  surname: string;
  trnc_id: string;
  hunting_license: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  userId: string;
  surveyId: string;
}

export interface UserResponse {
  surveyId: string;
  userId: string;
  answers: Answer[];
}
