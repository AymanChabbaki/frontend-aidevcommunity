import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { formService } from '@/services/form.service';
import { FileText, Search, Plus, Eye, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface AdminManageFormsProps {
  onCreateForm?: () => void;
}

const AdminManageForms = ({ onCreateForm }: AdminManageFormsProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; formId: string | null }>({
    open: false,
    formId: null,
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; form: any | null }>({
    open: false,
    form: null,
  });
  const [loadingForm, setLoadingForm] = useState(false);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getAllForms();
      // ADMIN sees all forms, STAFF sees only their own
      const filteredData = user?.role === 'ADMIN' 
        ? response.data || [] 
        : (response.data || []).filter((form: any) => form.createdBy === user?.id);
      setForms(filteredData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch forms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [location.pathname, location.state, user?.id]);

  const handleViewForm = async (formId: string) => {
    try {
      setLoadingForm(true);
      const response = await formService.getFormById(formId);
      setViewDialog({ open: true, form: response.data });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch form details',
        variant: 'destructive',
      });
    } finally {
      setLoadingForm(false);
    }
  };

  const getFieldTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-500',
      email: 'bg-green-500',
      textarea: 'bg-purple-500',
      select: 'bg-orange-500',
      checkbox: 'bg-pink-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleDelete = async () => {
    if (!deleteDialog.formId) return;

    try {
      await formService.deleteForm(deleteDialog.formId);
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
      fetchForms();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, formId: null });
    }
  };

  const handleExport = async (formId: string) => {
    try {
      const response = await formService.exportResponses(formId);
      // Create a blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-responses-${formId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Form responses exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to export responses',
        variant: 'destructive',
      });
    }
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedForms = filteredForms.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Forms</h1>
          <p className="text-muted-foreground">View, export, and delete forms</p>
        </div>
        <Button onClick={() => onCreateForm ? onCreateForm() : navigate('/admin/create-form')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
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
            <p className="text-center text-muted-foreground">Loading forms...</p>
          </CardContent>
        </Card>
      ) : filteredForms.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? 'No forms found matching your search' : 'No forms created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{form.title}</p>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{form.fields?.length || 0} fields</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{form._count?.responses || 0} responses</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewForm(form.id)}
                          disabled={loadingForm}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(form.id)}
                          disabled={!form._count?.responses}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, formId: form.id })}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredForms.length)} of {filteredForms.length} forms
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

      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, form: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewDialog.form && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{viewDialog.form.title}</DialogTitle>
                    {viewDialog.form.description && (
                      <DialogDescription className="text-base">{viewDialog.form.description}</DialogDescription>
                    )}
                  </div>
                  <Button onClick={() => handleExport(viewDialog.form.id)} disabled={!viewDialog.form._count?.responses} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{viewDialog.form._count?.responses || 0}</p>
                      <p className="text-sm text-muted-foreground">Responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{viewDialog.form.fields?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Fields</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(viewDialog.form.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Form Fields</h3>
                  <div className="space-y-3">
                    {viewDialog.form.fields?.map((field: any, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{field.label}</p>
                          {field.placeholder && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Placeholder: {field.placeholder}
                            </p>
                          )}
                          {field.options && field.options.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Options: {field.options.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getFieldTypeBadge(field.type)}>
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="outline" className="bg-red-500/10">Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, formId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This action cannot be undone and all responses will be lost.
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

export default AdminManageForms;
