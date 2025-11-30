'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Trash2, Mail, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createEmailListAction, deleteEmailListAction, addRecipientToListAction, getRecipientsForListAction, deleteRecipientAction } from '../actions';
import { Separator } from '@/components/ui/separator';

type EmailList = {
  id: string;
  name: string;
};

type Recipient = {
  id: string;
  email: string;
  name: string | null;
};

function CreateListSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create List'}
    </Button>
  );
}

function AddRecipientSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Recipient'}
      <UserPlus className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function EmailListManager({ emailLists }: { emailLists: EmailList[] }) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<EmailList | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  
  const createFormRef = useRef<HTMLFormElement>(null);
  const addRecipientFormRef = useRef<HTMLFormElement>(null);
  
  const [createState, createAction] = useFormState(createEmailListAction, { success: false, message: '' });
  const [addRecipientState, addRecipientAction] = useFormState(addRecipientToListAction, { success: false, message: '' });

  // Handle create list response
  useEffect(() => {
    if (createState.message) {
      toast({
        title: createState.success ? 'Success!' : 'Error',
        description: createState.message,
        variant: createState.success ? 'default' : 'destructive',
      });
      if (createState.success) {
        setCreateDialogOpen(false);
        createFormRef.current?.reset();
      }
    }
  }, [createState, toast]);

  // Handle add recipient response
  useEffect(() => {
    if (addRecipientState.message) {
      toast({
        title: addRecipientState.success ? 'Success!' : 'Error',
        description: addRecipientState.message,
        variant: addRecipientState.success ? 'default' : 'destructive',
      });
      if (addRecipientState.success) {
        addRecipientFormRef.current?.reset();
        // Refresh recipients list
        if (selectedList) {
          loadRecipients(selectedList.id);
        }
      }
    }
  }, [addRecipientState, toast, selectedList]);

  const loadRecipients = async (listId: string) => {
    setLoadingRecipients(true);
    try {
      const data = await getRecipientsForListAction(listId);
      setRecipients(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recipients.',
        variant: 'destructive',
      });
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleManageList = (list: EmailList) => {
    setSelectedList(list);
    setManageDialogOpen(true);
    loadRecipients(list.id);
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    const result = await deleteEmailListAction(listId);
    toast({
      title: result.success ? 'Success!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  const handleDeleteRecipient = async (email: string) => {
    if (!selectedList) return;
    
    const result = await deleteRecipientAction(selectedList.id, email);
    toast({
      title: result.success ? 'Success!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      loadRecipients(selectedList.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Email Notification Lists</h3>
          <p className="text-sm text-muted-foreground">Create and manage who gets notified about returning visitors.</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Email List</DialogTitle>
              <DialogDescription>
                Create a new notification list to organize your email recipients.
              </DialogDescription>
            </DialogHeader>
            <form ref={createFormRef} action={createAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Volunteer Team, Board Members"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <CreateListSubmitButton />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {emailLists.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No email lists created yet.</p>
          <p className="text-sm">Create your first list to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {emailLists.map((list) => (
            <div key={list.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{list.name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageList(list)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Email List</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{list.name}"? This will also remove all recipients from this list. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteList(list.id, list.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete List
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Recipients Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage "{selectedList?.name}" Recipients</DialogTitle>
            <DialogDescription>
              Add or remove email addresses from this notification list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add Recipient Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Add New Recipient</h4>
              <form ref={addRecipientFormRef} action={addRecipientAction} className="flex gap-2">
                <input type="hidden" name="listId" value={selectedList?.id || ''} />
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  className="flex-1"
                  required
                />
                <AddRecipientSubmitButton />
              </form>
            </div>

            <Separator />

            {/* Recipients List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Recipients</h4>
                {recipients.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {loadingRecipients ? (
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ) : recipients.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No recipients added yet.</p>
                  <p className="text-xs">Add email addresses above to get started.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${index !== recipients.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{recipient.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecipient(recipient.email)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setManageDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}