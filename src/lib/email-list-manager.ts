import fs from 'fs';
import path from 'path';

export interface EmailList {
  id: string;
  name: string;
  emails: string[];
}

export interface EmailListData {
  emailLists: EmailList[];
}

const EMAIL_LISTS_FILE = path.join(process.cwd(), 'src/lib/email-lists.json');

export function getEmailLists(): EmailList[] {
  try {
    const fileContent = fs.readFileSync(EMAIL_LISTS_FILE, 'utf8');
    const data: EmailListData = JSON.parse(fileContent);
    return data.emailLists;
  } catch (error) {
    console.error('Error reading email lists:', error);
    return [];
  }
}

export function saveEmailLists(emailLists: EmailList[]): boolean {
  try {
    const data: EmailListData = { emailLists };
    fs.writeFileSync(EMAIL_LISTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving email lists:', error);
    return false;
  }
}

export function addEmailList(name: string): boolean {
  const emailLists = getEmailLists();
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Check if list already exists
  if (emailLists.find(list => list.id === id)) {
    return false;
  }
  
  emailLists.push({
    id,
    name,
    emails: []
  });
  
  return saveEmailLists(emailLists);
}

export function deleteEmailList(id: string): boolean {
  const emailLists = getEmailLists();
  const filteredLists = emailLists.filter(list => list.id !== id);
  return saveEmailLists(filteredLists);
}

export function addEmailToList(listId: string, email: string): boolean {
  const emailLists = getEmailLists();
  const list = emailLists.find(l => l.id === listId);
  
  if (!list) return false;
  
  // Check if email already exists
  if (list.emails.includes(email)) return false;
  
  list.emails.push(email);
  return saveEmailLists(emailLists);
}

export function removeEmailFromList(listId: string, email: string): boolean {
  const emailLists = getEmailLists();
  const list = emailLists.find(l => l.id === listId);
  
  if (!list) return false;
  
  list.emails = list.emails.filter(e => e !== email);
  return saveEmailLists(emailLists);
}