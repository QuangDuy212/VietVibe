

import { useEffect, useState, useRef, useCallback } from "react";
import {
  callFetchLessonsPaginated,
  callCreateLesson,
  callUpdateLesson,
  callDeleteLesson,
  callUploadFile,
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
  FileText,
  Upload, Video, X
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
    {
      id: "1",
      word: "Hello",
      meaning: "Xin chào",
      example: "Hello, nice to meet you!",
    },
    { id: "2", word: "Name", meaning: "Tên", example: "My name is Anna." },
  ],
};

const FAKE_CONTENT: Record<
  string,
  { grammar: string; vocab: string; phonetic: string }
> = {
  "1": {
    grammar: "Câu giới thiệu: My name is + [tên]\nI am + [tuổi] years old.",
    vocab: "- Hello: xin chào\n- Name: tên\n- Nice: vui, tốt",
    phonetic: "hello /həˈloʊ/\nname /neɪm/",
  },
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

  // Nội dung: grammar, vocab, phonetic
  const [grammar, setGrammar] = useState("");
  const [vocab, setVocab] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLessons();
  }, [page, pageSize]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await callFetchLessonsPaginated(page, pageSize);
      console.log(">>> check res fetch lessons: ", res);
      if (res?.data) {
        const data = res.data as unknown;
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

      // Load content
      const content = FAKE_CONTENT[lesson._id] || {
        grammar: "",
        vocab: "",
        phonetic: "",
      };
      setGrammar(content.grammar);
      setVocab(content.vocab);
      setPhonetic(content.phonetic);
    } else {
      setEditingLesson(null);
      setFormData({ lessontitle: "", videourl: "", description: "" });
      setVocabularies([]);
      setGrammar("");
      setVocab("");
      setPhonetic("");
      setVideoFile(null);
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
    setVocabularies(
      vocabularies.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const deleteVocab = (id: string) => {
    setVocabularies(vocabularies.filter((v) => v.id !== id));
  };

  const handleSave = async () => {
    if (!formData.lessontitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        vocabularies,
        grammar,
        vocab,
        phonetic,
      };
      let videoUrl = formData.video_url;

      // Upload video if a file is selected
      if (videoFile) {
        const uploadedUrl = await uploadVideo(videoFile);
        if (uploadedUrl) {
          videoUrl = uploadedUrl;
        } else {
          return; // Stop if upload failed
        }
      }
      dataToSave.videourl = videoUrl;

      if (editingLesson) {
        await callUpdateLesson(editingLesson._id, dataToSave);
        toast.success("Lưu thay đổi thành công!");
      } else {
        await callCreateLesson(dataToSave);
        toast.success("Tạo bài học thành công!");
      }

      setDialogOpen(false);
      fetchLessons();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setFormData(prev => ({ ...prev, video_url: "" }));
      } else {
        toast.error("Please upload a video file");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setFormData(prev => ({ ...prev, video_url: "" }));
      } else {
        toast.error("Please upload a video file");
      }
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setFormData(prev => ({ ...prev, video_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const res = await callUploadFile(file, "video");
      return res.data.fileName;
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
      return null;
    } finally {
      setIsUploading(false);
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
            <Button
              onClick={() => openDialog()}
              className="gap-2 bg-red-500 hover:bg-red-600"
            >
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
                    <TableCell className="font-medium">
                      {lesson.lessontitle}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                      {lesson.videourl || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {lesson.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground gap-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{" "}
                          {lesson.createdBy || "admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lesson.createdAt
                            ? format(new Date(lesson.createdAt), "dd/MM/yyyy")
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(lesson)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDialog(lesson)}
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
              </TableBody>
            </Table>
          </div>

          {/* PHÂN TRANG */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
              >
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
              <span className="text-sm text-muted-foreground">
                trên tổng {totalLessons}
              </span>
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

      {/* DIALOG VỚI 3 TABS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Xem và chỉnh sửa thông tin bài học"
                : "Nhập thông tin bài học"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted">
              <TabsTrigger
                value="info"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Thông tin
              </TabsTrigger>
              <TabsTrigger
                value="vocabulary"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Từ vựng ({vocabularies.length})
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Nội dung
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: THÔNG TIN */}
            <TabsContent value="info" className="space-y-6 pt-8">
              <div>
                <Label className="text-base">Tiêu đề bài học *</Label>
                <Input
                  className="mt-2 text-lg"
                  value={formData.lessontitle}
                  onChange={(e) =>
                    setFormData({ ...formData, lessontitle: e.target.value })
                  }
                  placeholder="VD: Unit 1 - Greetings"
                />
              </div>
              <div>
                <Label>Video</Label>
                <div
                  className={`relative mt-2 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                    } ${videoFile || formData.video_url ? "p-4" : "p-8"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />

                  {videoFile ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : formData.video_url ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Current Video</p>
                        <p className="text-sm text-muted-foreground truncate">{formData.video_url}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="video-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Drag and drop video here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or <span className="text-primary underline">click to browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports: MP4, WebM, MOV, AVI
                      </p>
                    </label>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-base">Mô tả ngắn</Label>
                <Textarea
                  className="mt-2 min-h-32"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Học cách chào hỏi và giới thiệu bản thân"
                />
              </div>
            </TabsContent>

            {/* TAB 2: TỪ VỰNG */}
            <TabsContent value="vocabulary" className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Danh sách từ vựng</h3>
                <Button
                  onClick={addVocabulary}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
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
                        onChange={(e) =>
                          updateVocab(v.id, "word", e.target.value)
                        }
                        placeholder="Từ"
                        className="font-medium"
                      />
                      <Input
                        value={v.meaning}
                        onChange={(e) =>
                          updateVocab(v.id, "meaning", e.target.value)
                        }
                        placeholder="Nghĩa"
                      />
                      <Input
                        value={v.example}
                        onChange={(e) =>
                          updateVocab(v.id, "example", e.target.value)
                        }
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

            {/* TAB 3: NỘI DUNG (Grammar, Vocab, Phonetic) */}
            <TabsContent value="content" className="space-y-6 pt-6">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ngữ pháp (Grammar)
                </Label>
                <Textarea
                  value={grammar}
                  onChange={(e) => setGrammar(e.target.value)}
                  placeholder="Viết ghi chú ngữ pháp...

Ví dụ:
- Câu giới thiệu: My name is + [tên]
- Câu hỏi: What is your name?
- Cấu trúc: I am + [tuổi] years old"
                  className="mt-2 min-h-48 text-base leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Từ vựng (Vocab)
                </Label>
                <Textarea
                  value={vocab}
                  onChange={(e) => setVocab(e.target.value)}
                  placeholder="Viết nội dung từ vựng...

Ví dụ:
- Hello: xin chào
- Name: tên
- Nice: vui, tốt
- Meet: gặp"
                  className="mt-2 min-h-48 text-base leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  🔊 Phát âm (Phonetic)
                </Label>
                <Textarea
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  placeholder="Viết ghi chú phát âm...

Ví dụ:
- hello /həˈloʊ/
- name /neɪm/
- thank you /θæŋk juː/

Lưu ý: Chú ý phát âm âm 'th' trong thank"
                  className="mt-2 min-h-48 text-base leading-relaxed"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleSave}
            >
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
              Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonsManagement;
