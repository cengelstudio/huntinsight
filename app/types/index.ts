export interface User {
  id: string;
  name: string;
  surname: string;
  trnc_id: string;
  hunting_license: string;
  surveyId: string;
  createdAt: string;
}

export interface Option {
  id: string;
  text: string;
  nextQuestionId?: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  nextQuestionMap: Record<string, string | null>;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  optionId: string;
}

export interface Response {
  id: string;
  userId: string;
  name: string;
  surname: string;
  surveyId: string;
  answers: Answer[];
  completedAt: string;
}
