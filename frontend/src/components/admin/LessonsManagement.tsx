// import { useEffect, useState } from "react";
// import {

//   callFetchLessonsPaginated,
//   callCreateLesson,
//   callUpdateLesson,
//   callDeleteLesson
// } from "@/config/api";

// import { ILesson, IPaginationRes, IPaginationMeta } from "@/types/common.type";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import {
//   BookOpen, Plus, Edit, Trash2, User, Calendar,
//   ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
// } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { format } from "date-fns";

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const LessonsManagement = () => {
//   const [lessons, setLessons] = useState<ILesson[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalLessons, setTotalLessons] = useState(0);

//   const [formData, setFormData] = useState({
//     lessontitle: "",
//     videourl: "",
//     description: "",
//   });

//   useEffect(() => {
//     fetchLessons();
//   }, [page, pageSize]);

//   const fetchLessons = async () => {
//     try {
//       setLoading(true);
//       const res = await callFetchLessonsPaginated(page, pageSize);

//       if (res && res.data) {
//         // axios instance returns res.data (IBackendRes) directly from interceptor,
//         // so `res` is already IBackendRes<IPaginationRes<ILesson>> and its `data` is the
//         // pagination payload. Use `res.data` (not `res.data.data`).
//         const responseData: IPaginationRes<ILesson> = res.data;
//         setLessons(responseData?.result || []);
//         setTotalLessons(responseData?.meta?.total || 0);
//       }
//     } catch (error) {
//       console.error("Error fetching lessons:", error);
//       toast.error("Failed to load lessons list");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!formData.lessontitle) {
//         toast.error("Please enter a lesson title");
//         return;
//       }

//       let res;
//       if (editingLesson) {
//         res = await callUpdateLesson(editingLesson._id, formData);
//         if (res) toast.success("Lesson updated successfully");
//       } else {
//         res = await callCreateLesson(formData);
//         if (res) toast.success("Lesson created successfully");
//         setPage(1); // Quay về trang 1 khi tạo mới để thấy bài học
//       }

//       setDialogOpen(false);
//       await fetchLessons();

//     } catch (error) {
//       console.error("Error saving lesson:", error);
//       toast.error("An error occurred while saving");
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteId) return;
//     try {
//       await callDeleteLesson(deleteId);
//       toast.success("Lesson deleted successfully");

//       // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
//       if (lessons.length === 1 && page > 1) {
//         setPage(page - 1);
//       } else {
//         await fetchLessons();
//       }
//     } catch (error) {
//       console.error("Error deleting:", error);
//       toast.error("Could not delete lesson");
//     } finally {
//       setDeleteId(null);
//     }
//   }

//   const openCreateDialog = () => {
//     setEditingLesson(null);
//     setFormData({
//       lessontitle: "",
//       videourl: "",
//       description: "",
//     });
//     setDialogOpen(true);
//   };

//   const openEditDialog = (lesson: ILesson) => {
//     setEditingLesson(lesson);
//     console.log(">>>>> check lession: ", lesson) // Giữ nguyên log này nếu cần debug
//     setFormData({
//       lessontitle: lesson.lessontitle,
//       videourl: lesson.videourl || "",
//       description: lesson.description || "",
//     });
//     setDialogOpen(true);
//   };

//   //  PHÂN TRANG
//   const totalPages = Math.ceil(totalLessons / pageSize);
//   const hasNextPage = page < totalPages;
//   const hasPrevPage = page > 1;

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//     }
//   };

//   const handlePageSizeChange = (value: string) => {
//     const newPageSize = parseInt(value, 10);
//     setPageSize(newPageSize);
//     setPage(1);
//   }

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-8">
//           <div className="text-center text-muted-foreground">Loading data...</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card className="border-0 shadow-xl">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <BookOpen className="h-5 w-5" />
//                 Lessons List
//               </CardTitle>
//               <CardDescription>
//                 Manage your course content
//               </CardDescription>
//             </div>
//             <Button onClick={openCreateDialog} className="gap-2">
//               <Plus className="h-4 w-4" />
//               Add Lesson
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-xl border overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/50">
//                   <TableHead>Lesson Title</TableHead>
//                   <TableHead>Video URL</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Created Info</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {lessons.map((lesson) => (
//                   <TableRow key={lesson._id} className="hover:bg-muted/30">
//                     <TableCell className="font-medium">{lesson.lessontitle}</TableCell>
//                     <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
//                       {lesson.videourl}
//                     </TableCell>
//                     <TableCell className="max-w-xs truncate text-muted-foreground">
//                       {lesson.description}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex flex-col text-xs text-muted-foreground gap-1">
//                         <span className="flex items-center gap-1">
//                           <User className="h-3 w-3" /> {lesson.createdBy}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           {lesson.createdAt ? format(new Date(lesson.createdAt), 'dd/MM/yyyy') : 'N/A'}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex gap-2 justify-end">
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => openEditDialog(lesson)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => setDeleteId(lesson._id)}
//                         >
//                           <Trash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {lessons.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
//                       No lessons found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* 💡 GIAO DIỆN PHÂN TRANG */}
//           {totalLessons > 0 && (
//             <div className="flex items-center justify-between p-4 border-t">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-muted-foreground">Rows per page:</span>
//                 <Select onValueChange={handlePageSizeChange} value={String(pageSize)}>
//                   <SelectTrigger className="w-[70px]">
//                     <SelectValue placeholder={pageSize} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="5">5</SelectItem>
//                     <SelectItem value="10">10</SelectItem>
//                     <SelectItem value="20">20</SelectItem>
//                     <SelectItem value="50">50</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex items-center gap-4">
//                 <span className="text-sm text-muted-foreground">
//                   Page **{page}** of **{totalPages}** ({totalLessons} total items)
//                 </span>
//                 <div className="flex items-center space-x-2">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handlePageChange(1)}
//                     disabled={!hasPrevPage}
//                   >
//                     <ChevronsLeft className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handlePageChange(page - 1)}
//                     disabled={!hasPrevPage}
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handlePageChange(page + 1)}
//                     disabled={!hasNextPage}
//                   >
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handlePageChange(totalPages)}
//                     disabled={!hasNextPage}
//                   >
//                     <ChevronsRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Dialog Create/Edit */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>
//               {editingLesson ? "Edit Lesson" : "Add New Lesson"}
//             </DialogTitle>
//             <DialogDescription>
//               Enter lesson details below
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="lessontitle">Lesson Title *</Label>
//               <Input
//                 id="lessontitle"
//                 value={formData.lessontitle}
//                 onChange={(e) => setFormData({ ...formData, lessontitle: e.target.value })}
//                 placeholder="Ex: Introduction to Java"
//               />
//             </div>

//             <div>
//               <Label htmlFor="videourl">Video URL</Label>
//               <Input
//                 id="videourl"
//                 value={formData.videourl}
//                 onChange={(e) => setFormData({ ...formData, videourl: e.target.value })}
//                 placeholder="Ex: https://youtube.com/..."
//               />
//             </div>

//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Enter lesson content summary..."
//                 rows={4}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit}>
//               {editingLesson ? "Update" : "Create"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Alert Dialog Delete */}
//       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm delete</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this lesson? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete}>
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// };

// export default LessonsManagement;



import { useEffect, useState } from "react";
import {
  callFetchLessonsPaginated,
  callCreateLesson,
  callUpdateLesson,
  callDeleteLesson,
} from "@/config/api";

import { ILesson, IPaginationRes } from "@/types/common.type";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Headphones,
  FileText,
} from "lucide-react";

import { format } from "date-fns";

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
}

const FAKE_VOCAB: Record<string, Vocabulary[]> = {
  "1": [
    { id: "1", word: "Hello", meaning: "Xin chào", example: "Hello, nice to meet you!" },
    { id: "2", word: "Name", meaning: "Tên", example: "My name is Anna." },
  ],
};

const FAKE_GRAMMAR: Record<string, string> = {
  "1": "Câu giới thiệu: My name is + [tên]\nI am + [tuổi] years old.",
};

const FAKE_PRONUNCIATION: Record<string, string> = {
  "1": "hello /həˈloʊ/\nname /neɪm/\nLưu ý: Chú ý phát âm âm 'h' trong hello",
};

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

  const [activeTab, setActiveTab] = useState("info");
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [grammarNote, setGrammarNote] = useState("");
  const [pronunciationNote, setPronunciationNote] = useState("");

  useEffect(() => {
    fetchLessons();
  }, [page, pageSize]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await callFetchLessonsPaginated(page, pageSize);
      if (res?.data?.data) {
        const data = res.data.data as IPaginationRes<ILesson>;
        setLessons(data.result || []);
        setTotalLessons(data.meta?.total || 0);
      }
    } catch (error) {
      toast.error("Không tải được danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (lesson?: ILesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        lessontitle: lesson.lessontitle,
        videourl: lesson.videourl || "",
        description: lesson.description || "",
      });
      setVocabularies(FAKE_VOCAB[lesson._id] || []);
      setGrammarNote(FAKE_GRAMMAR[lesson._id] || "");
      setPronunciationNote(FAKE_PRONUNCIATION[lesson._id] || "");
    } else {
      setEditingLesson(null);
      setFormData({ lessontitle: "", videourl: "", description: "" });
      setVocabularies([]);
      setGrammarNote("");
      setPronunciationNote("");
    }
    setActiveTab("info");
    setDialogOpen(true);
  };

  const addVocabulary = () => {
    setVocabularies([
      ...vocabularies,
      { id: `new-${Date.now()}`, word: "", meaning: "", example: "" },
    ]);
  };

  const updateVocab = (id: string, field: keyof Vocabulary, value: string) => {
    setVocabularies(vocabularies.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const deleteVocab = (id: string) => {
    setVocabularies(vocabularies.filter(v => v.id !== id));
  };

  const handleSave = () => {
    if (!formData.lessontitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }
    toast.success(editingLesson ? "Lưu thay đổi thành công!" : "Tạo bài học thành công!");
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await callDeleteLesson(deleteId);
      toast.success("Xóa bài học thành công!");
      setDeleteId(null);
      fetchLessons();
    } catch (error) {
      toast.error("Không thể xóa bài học");
    }
  };

  const totalPages = Math.ceil(totalLessons / pageSize);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Đang tải...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* BẢNG CHÍNH */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lessons List
              </CardTitle>
              <CardDescription>Manage your course content</CardDescription>
            </div>
            <Button onClick={() => openDialog()} className="gap-2 bg-red-500 hover:bg-red-600">
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
                      {lesson.videourl || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {lesson.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground gap-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {lesson.createdBy || "admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lesson.createdAt ? format(new Date(lesson.createdAt), "dd/MM/yyyy") : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openDialog(lesson)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openDialog(lesson)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(lesson._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* PHÂN TRANG */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">trên tổng {totalLessons}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-4">
                Trang {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG VỚI 4 TABS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson ? "Xem và chỉnh sửa thông tin bài học" : "Nhập thông tin bài học"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4 rounded-full bg-muted">
              <TabsTrigger value="info" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="vocab" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                Từ vựng ({vocabularies.length})
              </TabsTrigger>
              <TabsTrigger value="grammar" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                Ngữ pháp
              </TabsTrigger>
              <TabsTrigger value="pronunciation" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                Ngữ âm
              </TabsTrigger>
            </TabsList>

            {/* TAB THÔNG TIN */}
            <TabsContent value="info" className="space-y-6 pt-8">
              <div>
                <Label className="text-base">Tiêu đề bài học *</Label>
                <Input
                  className="mt-2 text-lg"
                  value={formData.lessontitle}
                  onChange={(e) => setFormData({ ...formData, lessontitle: e.target.value })}
                  placeholder="VD: Unit 1 - Greetings"
                />
              </div>
              <div>
                <Label className="text-base">Link Video YouTube</Label>
                <Input
                  className="mt-2"
                  value={formData.videourl}
                  onChange={(e) => setFormData({ ...formData, videourl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label className="text-base">Mô tả ngắn</Label>
                <Textarea
                  className="mt-2 min-h-32"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Học cách chào hỏi và giới thiệu bản thân"
                />
              </div>
            </TabsContent>

            {/* TAB TỪ VỰNG */}
            <TabsContent value="vocab" className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Danh sách từ vựng</h3>
                <Button onClick={addVocabulary} className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm từ mới
                </Button>
              </div>

              <div className="space-y-4">
                {vocabularies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    Chưa có từ vựng nào. Nhấn nút trên để thêm!
                  </div>
                ) : (
                  vocabularies.map((v) => (
                    <div key={v.id} className="flex items-center gap-3">
                      <Input
                        value={v.word}
                        onChange={(e) => updateVocab(v.id, "word", e.target.value)}
                        placeholder="Từ"
                        className="font-medium"
                      />
                      <Input
                        value={v.meaning}
                        onChange={(e) => updateVocab(v.id, "meaning", e.target.value)}
                        placeholder="Nghĩa"
                      />
                      <Input
                        value={v.example}
                        onChange={(e) => updateVocab(v.id, "example", e.target.value)}
                        placeholder="Ví dụ"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteVocab(v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB NGỮ PHÁP */}
            <TabsContent value="grammar" className="pt-6">
              <Label className="text-lg font-medium mb-4 block">
                Ghi chú ngữ pháp
              </Label>
              <Textarea
                value={grammarNote}
                onChange={(e) => setGrammarNote(e.target.value)}
                placeholder="Viết ghi chú ngữ pháp ở đây... 

Ví dụ:
- Câu giới thiệu: My name is + [tên]
- Câu hỏi: What is your name?
- Cấu trúc: I am + [tuổi] years old"
                className="min-h-64 text-base leading-relaxed"
              />
            </TabsContent>

            {/* TAB NGỮ ÂM */}
            <TabsContent value="pronunciation" className="pt-6">
              <Label className="text-lg font-medium mb-4 block">
                Ghi chú ngữ âm & phát âm
              </Label>
              <Textarea
                value={pronunciationNote}
                onChange={(e) => setPronunciationNote(e.target.value)}
                placeholder="Viết ghi chú ngữ âm ở đây... 

Ví dụ:
- hello /həˈloʊ/
- name /neɪm/
- thank you /θæŋk juː/

Lưu ý: 
- Chú ý phát âm âm 'h' trong hello
- Âm 'th' trong thank phát âm đặc biệt"
                className="min-h-64 text-base leading-relaxed"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-10">
            <Button variant="outline" size="lg" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleSave}>
              {editingLesson ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT XÓA */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonsManagement;