import fs from 'fs';
import path from 'path';
import { User, Survey, UserResponse } from '@/app/types';

interface AdminConfig {
  password: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
function initializeFile(filePath: string, defaultContent: User[] | UserResponse[] | { surveys: Survey[] } | AdminConfig[] = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

initializeFile(USERS_FILE);
initializeFile(RESPONSES_FILE);
initializeFile(SURVEYS_FILE, { surveys: [] });
initializeFile(ADMIN_FILE, [{ password: 'admin123' }]);

// Users
export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export function addUser(user: User) {
  try {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

// Surveys
export function getSurveys(): Survey[] {
  try {
    const data = fs.readFileSync(SURVEYS_FILE, 'utf8');
    const { surveys } = JSON.parse(data);
    return surveys;
  } catch (error) {
    console.error('Error reading surveys:', error);
    return [];
  }
}

export function getSurveyById(id: string): Survey | null {
  const surveys = getSurveys();
  return surveys.find(survey => survey.id === id) || null;
}

export function updateSurvey(updatedSurvey: Survey): void {
  try {
    const data = fs.readFileSync(SURVEYS_FILE, 'utf8');
    const { surveys } = JSON.parse(data);
    const index = surveys.findIndex((s: Survey) => s.id === updatedSurvey.id);

    if (index !== -1) {
      surveys[index] = updatedSurvey;
      fs.writeFileSync(SURVEYS_FILE, JSON.stringify({ surveys }, null, 2));
    } else {
      throw new Error('Survey not found');
    }
  } catch (error) {
    console.error('Error updating survey:', error);
    throw error;
  }
}

// Responses
export function getResponses(): UserResponse[] {
  try {
    const data = fs.readFileSync(RESPONSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading responses:', error);
    return [];
  }
}

export function addResponse(response: UserResponse) {
  try {
    const responses = getResponses();
    responses.push(response);
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
  } catch (error) {
    console.error('Error adding response:', error);
    throw error;
  }
}

// Admin authentication
export const verifyAdminPassword = (password: string): boolean => {
  try {
    const data = fs.readFileSync(ADMIN_FILE, 'utf8');
    const adminConfig = JSON.parse(data);
    return adminConfig[0]?.password === password;
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return false;
  }
};
