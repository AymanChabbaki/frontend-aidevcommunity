import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { pollService } from '@/services/poll.service';
import { BarChart3, Search, Plus, Edit, Trash2, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface AdminManagePollsProps {
  onCreatePoll?: () => void;
}

const AdminManagePolls = ({ onCreatePoll }: AdminManagePollsProps = {}) => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pollId: string | null }>({
    open: false,
    pollId: null,
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; poll: any | null }>({
    open: false,
    poll: null,
  });
  const [loadingPoll, setLoadingPoll] = useState(false);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollService.getAllPolls();
      setPolls(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch polls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleViewPoll = async (pollId: string) => {
    try {
      setLoadingPoll(true);
      const response = await pollService.getPollById(pollId);
      setViewDialog({ open: true, poll: response.data });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch poll details',
        variant: 'destructive',
      });
    } finally {
      setLoadingPoll(false);
    }
  };

  const getTotalVotes = (poll: any) => {
    if (!poll?.options) return 0;
    return poll.options.reduce((sum: number, option: any) => sum + (option._count?.votes || 0), 0);
  };

  const getPercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  const handleDelete = async () => {
    if (!deleteDialog.pollId) return;

    try {
      await pollService.deletePoll(deleteDialog.pollId);
      toast({
        title: 'Success',
        description: 'Poll deleted successfully',
      });
      fetchPolls();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete poll',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, pollId: null });
    }
  };

  const filteredPolls = polls.filter(poll =>
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPolls = filteredPolls.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      case 'DRAFT': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Polls</h1>
          <p className="text-muted-foreground">View, edit, and delete polls</p>
        </div>
        <Button onClick={() => onCreatePoll ? onCreatePoll() : navigate('/admin/create-poll')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading polls...</p>
          </CardContent>
        </Card>
      ) : filteredPolls.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? 'No polls found matching your search' : 'No polls created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPolls.map((poll) => (
                  <TableRow key={poll.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{poll.question}</p>
                        <p className="text-sm text-muted-foreground">{poll.visibility}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{poll.options?.length || 0} options</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{poll._count?.votes || 0} votes</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(poll.endAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(poll.status)}>
                        {poll.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPoll(poll.id)}
                          disabled={loadingPoll}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, pollId: poll.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPolls.length)} of {filteredPolls.length} polls
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, poll: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewDialog.poll && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{viewDialog.poll.question}</DialogTitle>
                    <DialogDescription>
                      Created by {viewDialog.poll.createdBy?.displayName || 'Unknown'} • {format(new Date(viewDialog.poll.createdAt), 'MMM dd, yyyy')}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(viewDialog.poll.status)}>
                    {viewDialog.poll.status}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{getTotalVotes(viewDialog.poll)}</p>
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{viewDialog.poll.options?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Options</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Visibility</p>
                    <p className="text-lg font-semibold">{viewDialog.poll.visibility}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Start: {format(new Date(viewDialog.poll.startAt), 'MMM dd, yyyy hh:mm a')}</span>
                    <span>End: {format(new Date(viewDialog.poll.endAt), 'MMM dd, yyyy hh:mm a')}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Results</h3>
                  <div className="space-y-4">
                    {viewDialog.poll.options?.map((option: any) => {
                      const votes = option._count?.votes || 0;
                      const total = getTotalVotes(viewDialog.poll);
                      const percentage = getPercentage(votes, total);
                      
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.optionText}</span>
                            <span className="text-sm text-muted-foreground">
                              {votes} votes ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, pollId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManagePolls;
