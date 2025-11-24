import { useEffect, useState } from "react";
import { 
    callFetchLessons, 
    callCreateLesson, 
    callUpdateLesson, 
    callDeleteLesson 
} from "@/config/api";
import { ILesson } from "@/types/common.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, Plus, Edit, Trash2, User, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Thư viện format ngày tháng (cần cài: npm install date-fns)
import { format } from "date-fns"; 

const LessonsManagement = () => {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [deleteId, setDeleteId] = useState<string>(null);
  
  // State form khớp với field mới
  const [formData, setFormData] = useState({
    lessontitle: "",
    videourl: "",
    description: "",
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await callFetchLessons();
      if (res && res.data) {
          // Lưu ý: Tùy backend trả về mảng trực tiếp hay bọc trong thuộc tính data
          // Nếu backend trả về { data: [...] } thì dùng res.data.data
          // Ở đây tôi giả sử res.data là mảng Lesson hoặc res.data.data
          const dataList = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          setLessons(dataList);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons list");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.lessontitle) {
        toast.error("Please enter a lesson title");
        return;
      }

      let res;
      if (editingLesson) {
        res = await callUpdateLesson(editingLesson._id, formData);
        // Kiểm tra logic success tùy vào backend
        if(res) toast.success("Lesson updated successfully");
      } else {
        res = await callCreateLesson(formData);
        if(res) toast.success("Lesson created successfully");
      }
      
      setDialogOpen(false);
      await fetchLessons(); 

    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("An error occurred while saving");
    }
  };

  const handleDelete = async () => {
      if(!deleteId) return;
      try {
          await callDeleteLesson(deleteId);
          toast.success("Lesson deleted successfully");
          await fetchLessons();
      } catch (error) {
          console.error("Error deleting:", error);
          toast.error("Could not delete lesson");
      } finally {
          setDeleteId(null);
      }
  }

  // Reset form khi mở dialog
  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormData({
      lessontitle: "",
      videourl: "",
      description: "",
    });
    setDialogOpen(true);
  };

  // Fill dữ liệu khi mở dialog sửa
  const openEditDialog = (lesson: ILesson) => {
    setEditingLesson(lesson);
    console.log(">>>>> check lession: ", lesson)
    setFormData({
      lessontitle: lesson.lessontitle,
      videourl: lesson.videourl || "",
      description: lesson.description || "",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lessons List
              </CardTitle>
              <CardDescription>
                Manage your course content
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Video URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{lesson.lessontitle}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {lesson.videourl}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                        {lesson.description}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground gap-1">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {lesson.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> 
                                {lesson.createdAt ? format(new Date(lesson.createdAt), 'dd/MM/yyyy') : 'N/A'}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(lesson._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lessons.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No lessons found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              Enter lesson details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lessontitle">Lesson Title *</Label>
              <Input
                id="lessontitle"
                value={formData.lessontitle}
                onChange={(e) => setFormData({ ...formData, lessontitle: e.target.value })}
                placeholder="Ex: Introduction to Java"
              />
            </div>
            
            <div>
              <Label htmlFor="videourl">Video URL</Label>
              <Input
                id="videourl"
                value={formData.videourl}
                onChange={(e) => setFormData({ ...formData, videourl: e.target.value })}
                placeholder="Ex: https://youtube.com/..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter lesson content summary..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLesson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonsManagement;