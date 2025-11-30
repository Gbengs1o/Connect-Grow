import { getEmailListsData, getFirstTimeVisitors, getAttendanceEmailTemplate } from './actions';
import { AttendanceForm } from './components/AttendanceForm';
import { EmailListManager } from './components/EmailListManager';
import { MessageSettings } from './components/MessageSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default async function AttendancePage() {
  const firstTimeVisitors = await getFirstTimeVisitors();
  const emailLists = await getEmailListsData();
  const emailTemplate = await getAttendanceEmailTemplate();
  
  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Visitor Attendance</h1>
        <p className="text-muted-foreground">Track returning first-time visitors and notify the team.</p>
      </header>

      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to Use This Page</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li><b>Mark Attendance:</b> In the "First-Time Visitors" list below, place a checkmark next to every guest who returned today.</li>
            <li><b>Choose Who to Notify:</b> In the "Notification Lists" section, check the teams you want to email about these returning guests. (You can manage these lists in the card below).</li>
            <li><b>Submit:</b> Click "Submit Attendance". The system will automatically upgrade the visitors' status and send the emails.</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance List</CardTitle>
          <CardDescription>
            Select the first-time visitors who attended today. Submitting will upgrade their status to "Second Visit" and send a notification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceForm visitors={firstTimeVisitors} emailLists={emailLists} />
        </CardContent>
      </Card>

      {/* Email Message Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Message Settings</CardTitle>
          <CardDescription>
            Customize the subject and body of attendance notification emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageSettings template={emailTemplate} />
        </CardContent>
      </Card>

      {/* Email List Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Notification Lists</CardTitle>
          <CardDescription>
            Create and manage email lists to control who gets notified about returning visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailListManager emailLists={emailLists} />
        </CardContent>
      </Card>
    </div>
  );
}