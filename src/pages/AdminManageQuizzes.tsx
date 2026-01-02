import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, Trophy, Medal, Download, Upload, Bell } from 'lucide-react';
import * as XLSX from 'xlsx';
import quizService, { Quiz, QuizOption, LeaderboardEntry } from '../services/quiz.service';
import UserNotificationSelector from '../components/UserNotificationSelector';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface QuizFormData {
  title: string;
  description: string;
  coverImage: string;
  timeLimit: number;
  startAt: string;
  endAt: string;
  questions: {
    question: string;
    options: QuizOption[];
    points: number;
    order: number;
  }[];
}

const AdminManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteParticipantDialog, setDeleteParticipantDialog] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<{ userId: string; displayName: string } | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [createdQuizData, setCreatedQuizData] = useState<{ title: string; description: string; startAt: string; endAt: string } | null>(null);

  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    coverImage: '',
    timeLimit: 600, // 10 minutes default
    startAt: '',
    endAt: '',
    questions: [
      {
        question: '',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false },
          { id: '3', text: '', isCorrect: false },
          { id: '4', text: '', isCorrect: false },
        ],
        points: 1000,
        order: 0,
      },
    ],
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch quizzes',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description,
        coverImage: quiz.coverImage || '',
        timeLimit: quiz.timeLimit,
        startAt: new Date(quiz.startAt).toISOString().slice(0, 16),
        endAt: new Date(quiz.endAt).toISOString().slice(0, 16),
        questions: quiz.questions?.map((q, idx) => ({
          question: q.question,
          options: q.options,
          points: q.points,
          order: idx,
        })) || [],
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        coverImage: '',
        timeLimit: 600,
        startAt: '',
        endAt: '',
        questions: [
          {
            question: '',
            options: [
              { id: '1', text: '', isCorrect: false },
              { id: '2', text: '', isCorrect: false },
              { id: '3', text: '', isCorrect: false },
              { id: '4', text: '', isCorrect: false },
            ],
            points: 1000,
            order: 0,
          },
        ],
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.startAt || !formData.endAt) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    // Validate questions
    for (const question of formData.questions) {
      if (!question.question || question.options.some(opt => !opt.text)) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'All questions and options must have text',
        });
        return;
      }
      if (!question.options.some(opt => opt.isCorrect)) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Each question must have at least one correct answer',
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      const quizData = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz.id, quizData);
        toast({
          title: 'Success',
          description: 'Quiz updated successfully',
        });
        setDialogOpen(false);
        fetchQuizzes();
      } else {
        await quizService.createQuiz(quizData);
        toast({
          title: 'Success',
          description: 'Quiz created successfully',
        });
        setDialogOpen(false);
        fetchQuizzes();
        
        // Store quiz data and open notification dialog
        setCreatedQuizData({
          title: quizData.title,
          description: quizData.description,
          startAt: new Date(quizData.startAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          endAt: new Date(quizData.endAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        setNotificationDialogOpen(true);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save quiz',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewLeaderboard = async (quizId: string, quizTitle: string) => {
    try {
      setLoadingLeaderboard(true);
      setSelectedQuizId(quizId);
      setSelectedQuizTitle(quizTitle);
      setLeaderboardOpen(true);
      const data = await quizService.getQuizLeaderboard(quizId);
      setLeaderboard(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load leaderboard',
      });
      setLeaderboardOpen(false);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleDeleteParticipant = async () => {
    if (!selectedQuizId || !participantToDelete) return;

    try {
      await quizService.deleteQuizParticipant(selectedQuizId, participantToDelete.userId);
      
      // Refresh leaderboard
      const data = await quizService.getQuizLeaderboard(selectedQuizId);
      setLeaderboard(data);
      
      toast({
        title: 'Success',
        description: 'Participant removed successfully',
      });
      
      setDeleteParticipantDialog(false);
      setParticipantToDelete(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete participant',
      });
    }
  };

  const confirmDeleteParticipant = (userId: string, displayName: string) => {
    setParticipantToDelete({ userId, displayName });
    setDeleteParticipantDialog(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await quizService.deleteQuiz(quizId);
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully',
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete quiz',
      });
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
            { id: '3', text: '', isCorrect: false },
            { id: '4', text: '', isCorrect: false },
          ],
          points: 1000,
          order: formData.questions.length,
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        Question: 'What is the capital of France?',
        'Option 1': 'Paris',
        'Option 2': 'London',
        'Option 3': 'Berlin',
        'Option 4': 'Madrid',
        'Correct Option (1-4)': '1',
        'Points': '1000'
      },
      {
        Question: 'What is 2 + 2?',
        'Option 1': '3',
        'Option 2': '4',
        'Option 3': '5',
        'Option 4': '6',
        'Correct Option (1-4)': '2',
        'Points': '1000'
      }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');

    // Set column widths
    ws['!cols'] = [
      { wch: 50 }, // Question
      { wch: 30 }, // Option 1
      { wch: 30 }, // Option 2
      { wch: 30 }, // Option 3
      { wch: 30 }, // Option 4
      { wch: 20 }, // Correct Option
      { wch: 10 }  // Points
    ];

    // Download file
    XLSX.writeFile(wb, 'quiz_questions_template.xlsx');
    
    toast({
      title: 'Success',
      description: 'Template downloaded successfully',
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'The Excel file is empty',
          });
          return;
        }

        // Validate and convert to quiz questions format
        const importedQuestions = jsonData.map((row, index) => {
          const correctOptionIndex = parseInt(row['Correct Option (1-4)']) - 1;
          
          if (!row.Question || correctOptionIndex < 0 || correctOptionIndex > 3) {
            throw new Error(`Invalid data in row ${index + 2}`);
          }

          return {
            question: row.Question,
            options: [
              { id: '1', text: row['Option 1'] || '', isCorrect: correctOptionIndex === 0 },
              { id: '2', text: row['Option 2'] || '', isCorrect: correctOptionIndex === 1 },
              { id: '3', text: row['Option 3'] || '', isCorrect: correctOptionIndex === 2 },
              { id: '4', text: row['Option 4'] || '', isCorrect: correctOptionIndex === 3 },
            ],
            points: parseInt(row.Points) || 1000,
            order: index,
          };
        });

        setFormData({
          ...formData,
          questions: importedQuestions,
        });

        toast({
          title: 'Success',
          description: `${importedQuestions.length} questions imported successfully`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to import questions. Please check the file format.',
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      UPCOMING: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Manage Quizzes</h2>
            <p className="text-muted-foreground">Create and manage quiz competitions</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quizzes</CardTitle>
            <CardDescription>View and manage all quiz competitions</CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No quizzes yet. Create your first quiz!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                      <TableCell>{(quiz as any)._count?.questions || quiz.questions?.length || 0}</TableCell>
                      <TableCell>{Math.floor(quiz.timeLimit / 60)} min</TableCell>
                      <TableCell>{new Date(quiz.startAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(quiz.endAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLeaderboard(quiz.id, quiz.title)}
                            title="View Leaderboard"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(quiz)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingQuiz ? 'update' : 'create'} a quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter quiz description"
              />
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="timeLimit">Time Limit (seconds) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="startAt">Start Date *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endAt">End Date *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Questions</h3>
                <div className="flex gap-2">
                  <Button type="button" onClick={downloadTemplate} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button type="button" onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {formData.questions.map((question, qIndex) => (
                <Card key={qIndex} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                      {formData.questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text *</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter question"
                      />
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Options *</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2 mb-2">
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <label className="flex items-center gap-2 min-w-[120px]">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Correct</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Modal */}
      <Dialog open={leaderboardOpen} onOpenChange={setLeaderboardOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Leaderboard</DialogTitle>
            <DialogDescription>
              Top performers for this quiz
            </DialogDescription>
          </DialogHeader>

          {loadingLeaderboard ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No participants yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 */}
              {leaderboard.slice(0, 3).map((entry) => (
                <Card key={entry.userId} className={`${
                  entry.rank === 1 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                  entry.rank === 2 ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20' :
                  entry.rank === 3 ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/20' :
                  ''
                } border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Medal className={`h-6 w-6 ${
                          entry.rank === 1 ? 'text-yellow-500' :
                          entry.rank === 2 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                        <div>
                          <div className="font-semibold">{entry.displayName}</div>
                          <div className="text-sm text-muted-foreground">{entry.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{entry.totalScore}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDeleteParticipant(entry.userId, entry.displayName)}
                          title="Remove participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Rest */}
              {leaderboard.length > 3 && (
                <div className="space-y-2 pt-4 border-t">
                  {leaderboard.slice(3).map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground min-w-[30px]">
                          #{entry.rank}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{entry.displayName}</div>
                          <div className="text-xs text-muted-foreground">{entry.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold">{entry.totalScore}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDeleteParticipant(entry.userId, entry.displayName)}
                          title="Remove participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaderboardOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      {createdQuizData && (
        <UserNotificationSelector
          open={notificationDialogOpen}
          onOpenChange={setNotificationDialogOpen}
          defaultSubject={`New Quiz Available - ${createdQuizData.title}`}
          defaultMessage={`Hi there!

A new quiz has been created and is available for you to participate:

${createdQuizData.title}

${createdQuizData.description}

Available from: ${createdQuizData.startAt}
Until: ${createdQuizData.endAt}

Test your knowledge and compete for the top spot on the leaderboard!

Good luck!

Best regards,
AI Dev Community Team`}
        />
      )}

      {/* Delete Participant Confirmation Dialog */}
      <Dialog open={deleteParticipantDialog} onOpenChange={setDeleteParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{participantToDelete?.displayName}</strong> from this quiz?
              This will delete all their submissions and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteParticipantDialog(false);
                setParticipantToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteParticipant}
            >
              Remove Participant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManageQuizzes;
