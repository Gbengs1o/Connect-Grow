import { getAllVisitors } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Suspense } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/SearchInput';


export default async function VisitorsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const visitors = await getAllVisitors(query);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Visitors</h1>
            <p className="text-muted-foreground">Search and manage all visitors.</p>
        </div>
        <div className="w-full max-w-sm">
            <SearchInput placeholder="Search by name..." />
        </div>
      </header>
      
      <Card>
        <Suspense fallback={<p>Loading...</p>}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">{visitor.full_name}</TableCell>
                  <TableCell>{visitor.email}</TableCell>
                  <TableCell>{format(new Date(visitor.visit_date), 'PPP')}</TableCell>
                  <TableCell>
                  <Badge variant={
                      visitor.status === 'First Visit' ? 'destructive' : 
                      visitor.status === 'Membership' ? 'default' : 
                      'secondary'
                    } className="capitalize">
                      {visitor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/visitors/${visitor.id}`} className="text-primary hover:underline">
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
               {visitors.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No visitors found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Suspense>
      </Card>
    </div>
  );
}
