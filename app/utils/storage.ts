import { promises as fs } from 'fs';
import path from 'path';
import { User, Survey, Response } from '@/app/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

interface AdminConfig {
  password: string;
}

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize files if they don't exist
async function initializeFile(filePath: string, defaultContent: User[] | Response[] | Survey[] | AdminConfig[] = []) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

// Initialize all files
export async function initializeStorage() {
  await ensureDataDirectory();
  await Promise.all([
    initializeFile(USERS_FILE, []),
    initializeFile(SURVEYS_FILE, []),
    initializeFile(RESPONSES_FILE, []),
    initializeFile(ADMIN_FILE, [{ password: 'admin123' }])
  ]);
}

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function addUser(user: User): Promise<void> {
  try {
    const users = await getUsers();
    users.push(user);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

// Surveys
export async function getSurveys(): Promise<Survey[]> {
  try {
    const data = await fs.readFile(SURVEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading surveys:', error);
    return [];
  }
}

export async function writeSurveys(surveys: Survey[]): Promise<void> {
  try {
    await fs.writeFile(SURVEYS_FILE, JSON.stringify(surveys, null, 2));
  } catch (error) {
    console.error('Error writing surveys:', error);
  }
}

export async function getSurveyById(id: string): Promise<Survey | null> {
  const surveys = await getSurveys();
  return surveys.find(survey => survey.id === id) || null;
}

export async function updateSurvey(updatedSurvey: Survey): Promise<void> {
  try {
    const surveys = await getSurveys();
    const index = surveys.findIndex((s: Survey) => s.id === updatedSurvey.id);

    if (index !== -1) {
      surveys[index] = updatedSurvey;
      await writeSurveys(surveys);
    } else {
      throw new Error('Survey not found');
    }
  } catch (error) {
    console.error('Error updating survey:', error);
  }
}

// Responses
export async function getResponses(): Promise<Response[]> {
  try {
    const data = await fs.readFile(RESPONSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading responses:', error);
    return [];
  }
}

export async function addResponse(response: Response): Promise<void> {
  try {
    const responses = await getResponses();
    responses.push(response);
    await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2));
  } catch (error) {
    console.error('Error adding response:', error);
  }
}

// Admin
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const data = await fs.readFile(ADMIN_FILE, 'utf8');
    const adminConfig = JSON.parse(data);
    return adminConfig[0]?.password === password;
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return false;
  }
}
