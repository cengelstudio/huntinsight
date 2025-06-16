export interface User {
  id: string;
  name: string;
  surname: string;
  trncId: string;
  huntingLicenseNumber: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  nextQuestionMap: Record<string, string | null>;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  userId: string;
  surveyId: string;
  answers: {
    questionId: string;
    optionId: string;
  }[];
  completedAt: string;
}
