import { useEffect, useState } from "react";
import {
  
  callFetchLessonsPaginated,
  callCreateLesson,
  callUpdateLesson,
  callDeleteLesson
} from "@/config/api";

import { ILesson, IPaginationRes, IPaginationMeta } from "@/types/common.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen, Plus, Edit, Trash2, User, Calendar,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
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
import { format } from "date-fns";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const LessonsManagement = () => {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLessons, setTotalLessons] = useState(0);

  const [formData, setFormData] = useState({
    lessontitle: "",
    videourl: "",
    description: "",
  });

  
  useEffect(() => {
    fetchLessons();
  }, [page, pageSize]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await callFetchLessonsPaginated(page, pageSize);

      if (res && res.data) {
        // axios instance returns res.data (IBackendRes) directly from interceptor,
        // so `res` is already IBackendRes<IPaginationRes<ILesson>> and its `data` is the
        // pagination payload. Use `res.data` (not `res.data.data`).
        const responseData: IPaginationRes<ILesson> = res.data;
        setLessons(responseData?.result || []);
        setTotalLessons(responseData?.meta?.total || 0);
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
        if (res) toast.success("Lesson updated successfully");
      } else {
        res = await callCreateLesson(formData);
        if (res) toast.success("Lesson created successfully");
        setPage(1); // Quay về trang 1 khi tạo mới để thấy bài học
      }

      setDialogOpen(false);
      await fetchLessons();

    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("An error occurred while saving");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await callDeleteLesson(deleteId);
      toast.success("Lesson deleted successfully");

      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      if (lessons.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchLessons();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Could not delete lesson");
    } finally {
      setDeleteId(null);
    }
  }

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormData({
      lessontitle: "",
      videourl: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (lesson: ILesson) => {
    setEditingLesson(lesson);
    console.log(">>>>> check lession: ", lesson) // Giữ nguyên log này nếu cần debug
    setFormData({
      lessontitle: lesson.lessontitle,
      videourl: lesson.videourl || "",
      description: lesson.description || "",
    });
    setDialogOpen(true);
  };

  //  PHÂN TRANG
  const totalPages = Math.ceil(totalLessons / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    setPageSize(newPageSize);
    setPage(1);
  }


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

          {/* 💡 GIAO DIỆN PHÂN TRANG */}
          {totalLessons > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select onValueChange={handlePageSizeChange} value={String(pageSize)}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Page **{page}** of **{totalPages}** ({totalLessons} total items)
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={!hasPrevPage}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={!hasNextPage}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
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