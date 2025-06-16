import fs from 'fs';
import path from 'path';
import { User, Survey, UserResponse } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper function to read JSON file
const readJsonFile = <T>(filename: string): T[] => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write JSON file
const writeJsonFile = <T>(filename: string, data: T[]): void => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// User operations
export const getUsers = (): User[] => readJsonFile<User>('users.json');
export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  writeJsonFile('users.json', users);
};

// Survey operations
export const getSurveys = (): Survey[] => readJsonFile<Survey>('surveys.json');
export const addSurvey = (survey: Survey): void => {
  const surveys = getSurveys();
  surveys.push(survey);
  writeJsonFile('surveys.json', surveys);
};
export const updateSurvey = (survey: Survey): void => {
  const surveys = getSurveys();
  const index = surveys.findIndex(s => s.id === survey.id);
  if (index !== -1) {
    surveys[index] = survey;
    writeJsonFile('surveys.json', surveys);
  }
};

// Response operations
export const getResponses = (): UserResponse[] => readJsonFile<UserResponse>('responses.json');
export const addResponse = (response: UserResponse): void => {
  const responses = getResponses();
  responses.push(response);
  writeJsonFile('responses.json', responses);
};

// Admin authentication
export const verifyAdminPassword = (password: string): boolean => {
  const adminConfig = readJsonFile<{ password: string }>('admin.json');
  return adminConfig[0]?.password === password;
};
