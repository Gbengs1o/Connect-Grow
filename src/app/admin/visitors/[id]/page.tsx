import { getVisitorById, getCommunicationsForVisitor } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, Handshake, Text, CheckCircle, Clock, MessageSquare, Bot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StatusUpdateForm } from './components/StatusUpdateForm';
import { FollowUpGenerator } from './components/FollowUpGenerator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function VisitorDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const visitor = await getVisitorById(id);
  
  if (!visitor) {
    notFound();
  }
  
  const communications = await getCommunicationsForVisitor(id);

  const detailItems = [
    { icon: User, label: "Full Name", value: visitor.full_name },
    { icon: Mail, label: "Email", value: visitor.email },
    { icon: Phone, label: "Phone", value: visitor.phone_number },
    { icon: Calendar, label: "Visit Date", value: format(new Date(visitor.visit_date), 'PPP') },
    { icon: Handshake, label: "Source", value: visitor.source },
    { icon: Text, label: "Service Type", value: visitor.service_type },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
       <header>
        <h1 className="text-3xl font-bold font-headline">{visitor.full_name}</h1>
        <p className="text-muted-foreground">Detailed visitor profile and communication history.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Visitor Details</CardTitle>
                <CardDescription>
                    Current status: <Badge variant={visitor.status === 'First Visit' ? 'destructive' : 'secondary'} className="align-middle ml-1">{visitor.status}</Badge>
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {detailItems.map(item => item.value && (
                            <div key={item.label} className="flex items-start gap-3">
                                <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-semibold">{item.label}</p>
                                    <p className="text-muted-foreground">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {visitor.prayer_request && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="font-semibold text-sm">Prayer Request</p>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{visitor.prayer_request}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Assisted Follow-up</CardTitle>
                    <CardDescription>Generate a personalized follow-up message for {visitor.full_name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FollowUpGenerator visitor={visitor} />
                </CardContent>
            </Card>

        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the visitor's follow-up status.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm visitorId={visitor.id} currentStatus={visitor.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Communication Log</CardTitle>
                <CardDescription>History of messages sent to this visitor.</CardDescription>
            </CardHeader>
            <CardContent>
                {communications.length > 0 ? (
                <ul className="space-y-4">
                    {communications.map(log => (
                    <li key={log.id} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 mt-1">
                        {log.status === 'sent' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div>
                            <p className="font-medium">{log.message_type || 'Message'} via {log.channel || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(log.sent_at), 'PPp')}</p>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No communications logged yet.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
