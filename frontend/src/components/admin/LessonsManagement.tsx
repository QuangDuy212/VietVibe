

import { useEffect, useState, useRef, useCallback } from "react";
import {
  callFetchLessonsPaginated,
  callCreateLesson,
  callUpdateLesson,
  callDeleteLesson,
  callUploadFile,
  callFetchVocbulary,
  callFetchLessonDetail,
  callUpdateLessonDetail,
  callCreateLessonDetail,
  callDeleteVocabulary,
  callCreateVocabulariesBatch,
  callCreateVocabulary,
  callUpdateVocabulary,
  callDeleteLessonDetail,
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
  Upload, Video, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Lesson from "@/pages/Lesson";

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
}
const levelColors = {
  BEGINNER: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  INTERMEDIATE: "bg-accent/10 text-accent hover:bg-accent/20",
  ADVANCE: "bg-primary/10 text-primary hover:bg-primary/20",
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
    level: "",
  });

  const [activeTab, setActiveTab] = useState("info");
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [lessonDetailId, setLessonDetailId] = useState<string | null>(null);
  const [removedVocabIds, setRemovedVocabIds] = useState<string[]>([]);

  // Content: grammar, vocab, phonetic
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
      toast.error("Failed to fetch lesson list");
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
        level: lesson.level || "",
      });

      // Fetch vocabulary and lesson details from API
      const fetchLessonData = async () => {
        try {
          const [vocabRes, detailRes] = await Promise.all([
            callFetchVocbulary(lesson._id),
            callFetchLessonDetail(lesson._id),
          ]);

          // Transform vocabulary data
          const vocabData = vocabRes?.data || [];
          const transformedVocab: Vocabulary[] = (Array.isArray(vocabData) ? vocabData : [])
            .map((item: any) => ({
              id: item._id || `vocab-${Date.now()}`,
              word: item.word,
              meaning: item.englishMeaning,
              example: item.exampleSentence,
            }));
          setVocabularies(transformedVocab);

          // Load lesson details
          const detailData = detailRes?.data || {};
          setGrammar(detailData.gramma || "");
          setVocab(detailData.vocab || "");
          setPhonetic(detailData.phonetic || "");
          setLessonDetailId(detailData._id || null);
        } catch (error) {
          console.error("Error fetching lesson data:", error);
          setVocabularies([]);
          setGrammar("");
          setVocab("");
          setPhonetic("");
        }
      };

      fetchLessonData();
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
    // If it's a newly created local vocab, just remove it from the UI state
    if (id.startsWith("new-")) {
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
      return;
    }

    // For existing vocab, record its id for deletion on save and remove from UI
    setRemovedVocabIds((prev) => [...prev, id]);
    setVocabularies((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSave = async () => {
    if (!formData.lessontitle.trim()) {
      toast.error("Please enter a lesson title");
      return;
    }

    try {
      // Prepare basic lesson payload
      const lessonPayload = {
        lessontitle: formData.lessontitle,
        videourl: formData.videourl,
        description: formData.description,
        level: formData.level,
      };
      let videoUrl = formData.video_url;

      // Upload video if a file is selected
      if (videoFile) {
        const uploadedUrl = await uploadVideo(videoFile);
        console.log(">>>>>>> check uploadedUrl: ", uploadedUrl)
        if (uploadedUrl) {
          lessonPayload.videourl = uploadedUrl;
          console.log(">>>>> check edding lesstion", editingLesson)
        } else {
          return; // Stop if upload failed
        }
      }
      if (editingLesson) {
        // Update lesson basic info
        const updateRes = await callUpdateLesson(editingLesson._id, lessonPayload);
        console.log('updateLesson response:', updateRes);

        // Upsert lesson detail
        if (lessonDetailId) {
          try {
            const updDetailRes = await callUpdateLessonDetail(lessonDetailId, {
              gramma: grammar,
              vocab,
              phonetic,
              lessonId: editingLesson._id,
            });
            console.log('updateLessonDetail response:', updDetailRes);
          } catch (e) {
            console.error('Failed to update lesson detail', e);
            toast.error('Failed to update lesson content');
          }
        } else {
          try {
            const createDetailRes = await callCreateLessonDetail({
              gramma: grammar,
              vocab,
              phonetic,
              lessonId: editingLesson._id,
            });
            console.log('createLessonDetail response:', createDetailRes);
            const created = createDetailRes?.data?.data;
            if (created && created._id) setLessonDetailId(created._id);
          } catch (e) {
            console.error('Failed to create lesson detail', e);
            toast.error('Failed to save lesson content');
          }
        }

        // Delete removed vocabularies
        for (const vid of removedVocabIds) {
          try {
            const delRes = await callDeleteVocabulary(vid);
            console.log('deleteVocabulary response for', vid, delRes);
          } catch (e) {
            console.warn("Failed to delete vocab", vid, e);
            toast.error(`Failed to delete vocabulary ${vid}`);
          }
        }

        // Create new vocabularies in batch if exist
        const newVocs = vocabularies
          .filter((v) => v.id.startsWith("new-"))
          .map((v) => ({
            word: v.word,
            englishMeaning: v.meaning,
            exampleSentence: v.example,
            lessonId: editingLesson._id,
          }));

        if (newVocs.length) {
          const validNewVocs = newVocs.filter((v) => v.word && v.englishMeaning);
          try {
            const batchRes = await callCreateVocabulariesBatch(validNewVocs);
            console.log('createVocabulariesBatch response for new items:', batchRes);
          } catch (e) {
            console.error('Failed to create new vocabularies batch', e);
            // fallback to per-item creates
            for (const nv of validNewVocs) {
              try {
                const resV = await callCreateVocabulary(nv);
                console.log('createVocabulary response for new item:', resV);
              } catch (err) {
                console.error('Failed to create vocab item', nv, err);
              }
            }
            toast.error('Failed to create some new vocabulary items');
          }
        }

        // Update existing vocabularies
        const existingVocs = vocabularies.filter((v) => !v.id.startsWith("new-"));
        for (const v of existingVocs) {
          try {
            const updVRes = await callUpdateVocabulary(v.id, {
              word: v.word,
              englishMeaning: v.meaning,
              exampleSentence: v.example,
              lessonId: editingLesson._id,
            });
            console.log('updateVocabulary response for', v.id, updVRes);
          } catch (e) {
            console.warn("Failed to update vocab", v.id, e);
            toast.error(`Failed to update word ${v.word}`);
          }
        }

        toast.success("Changes saved successfully!");
      } else {
        // Create new lesson
        const res = await callCreateLesson(lessonPayload as any);
        console.log(">>>>>> check res: ", res);
        // handle different possible response shapes
        const createdLesson = (res?.data?.data ?? res?.data) as ILesson | any | undefined;
        const lessonId = createdLesson?._id || createdLesson?.id || createdLesson?.lessonId;

        if (lessonId) {
          // Create lesson detail
          try {
            const detailRes = await callCreateLessonDetail({
              gramma: grammar,
              vocab,
              phonetic,
              lessonId,
            });
            console.log("createLessonDetail response:", detailRes);
            const createdDetail = detailRes?.data?.data ?? detailRes?.data;
            const createdDetailId = createdDetail?._id || createdDetail?.id;
            if (createdDetailId) {
              setLessonDetailId(createdDetailId);
            }
          } catch (e) {
            console.error("Failed to create lesson detail", e);
            toast.error("Failed to save lesson content");
          }

          // Create vocabularies in batch - filter out empty entries
          const validVocs = vocabularies
            .filter((v) => v.word.trim() && v.meaning.trim())
            .map((v) => ({
              word: v.word,
              englishMeaning: v.meaning,
              exampleSentence: v.example,
              lessonId,
            }));

          console.log('validVocs to create (batch):', validVocs);

          if (validVocs.length) {
            try {
              const batchRes = await callCreateVocabulariesBatch(validVocs);
              console.log('createVocabulariesBatch response:', batchRes);
            } catch (e) {
              console.error('Failed to create vocabularies batch', e);
              // fallback: try creating individually
              for (const vv of validVocs) {
                try {
                  const resV = await callCreateVocabulary(vv);
                  console.log('createVocabulary response for', vv, resV);
                } catch (err) {
                  console.error('Failed to create vocab', vv, err);
                }
              }
              toast.error('Failed to create some vocabulary items');
            }
          } else {
            console.log('No valid vocabularies to create (all empty)');
          }
        }

        toast.success("Lesson created successfully!");
      }

      // Cleanup and refresh
      setRemovedVocabIds([]);
      setLessonDetailId(null);
      setDialogOpen(false);
      fetchLessons();
    } catch (error) {
      toast.error("An error occurred!");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await callDeleteLesson(deleteId);
      toast.success("Lesson successfully deleted!");
      setDeleteId(null);
      fetchLessons();
    } catch (error) {
      toast.error("Failed to delete lesson");
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
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* MAIN TABLE */}
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
                  <TableHead>Level</TableHead>
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
                    <TableCell className="font-medium">

                      <Badge className={levelColors[lesson.level]}>{lesson.level}</Badge>

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

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
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
                of total {totalLessons}
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
                Page {page} / {totalPages || 1}
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

      {/* DIALOG WITH 3 TABS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingLesson ? "Edit Lesson" : "Create New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "View and edit lesson information"
                : "Enter lesson information"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted">
              <TabsTrigger
                value="info"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Information
              </TabsTrigger>
              <TabsTrigger
                value="vocabulary"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Vocabulary ({vocabularies.length})
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Content
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: INFORMATION */}
            <TabsContent value="info" className="space-y-6 pt-8">
              <div className="flex gap-4">
  {/* Cột 1: Level */}
  <div className="flex-1">
    <Label>Level*</Label>
    <Select
      value={formData.level}
      onValueChange={(e) =>
        setFormData({ ...formData, level: e })
      }
    >
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="Choose lesson level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BEGINNER">
          Beginner
        </SelectItem>
        <SelectItem value="INTERMEDIATE">
          Intermediate
        </SelectItem>
        <SelectItem value="ADVANCE">
          Advance
        </SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Cột 2: Lesson Title */}
  <div className="flex-1">
    <Label className="text-base">Lesson Title *</Label>
    <Input
      className="mt-2 text-lg"
      value={formData.lessontitle}
      onChange={(e) =>
        setFormData({ ...formData, lessontitle: e.target.value })
      }
      placeholder="E.g.: Unit 1 - Greetings"
    />
  </div>
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
                <Label className="text-base">Short Description</Label>
                <Textarea
                  className="mt-2 min-h-32"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Learn how to greet and introduce yourself"
                />
              </div>
            </TabsContent>

            {/* TAB 2: VOCABULARY */}
            <TabsContent value="vocabulary" className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Vocabulary List</h3>
                <Button
                  onClick={addVocabulary}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Word
                </Button>
              </div>

              <div className="space-y-4">
                {vocabularies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No vocabulary yet. Click the button above to add some!
                  </div>
                ) : (
                  vocabularies.map((v) => (
                    <div key={v.id} className="flex items-center gap-3">
                      <Input
                        value={v.word}
                        onChange={(e) =>
                          updateVocab(v.id, "word", e.target.value)
                        }
                        placeholder="Word"
                        className="font-medium"
                      />
                      <Input
                        value={v.meaning}
                        onChange={(e) =>
                          updateVocab(v.id, "meaning", e.target.value)
                        }
                        placeholder="Meaning"
                      />
                      <Input
                        value={v.example}
                        onChange={(e) =>
                          updateVocab(v.id, "example", e.target.value)
                        }
                        placeholder="Example"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const message = v.id.startsWith("new-")
                            ? "Remove this word from the list?"
                            : "Are you sure you want to delete this word? (will be deleted on server when saving)";
                          if (window.confirm(message)) {
                            deleteVocab(v.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB 3: CONTENT (Grammar, Vocab, Phonetic) */}
            <TabsContent value="content" className="space-y-6 pt-6">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Grammar
                  </Label>
                  {lessonDetailId ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!lessonDetailId) return;
                        const ok = window.confirm(
                          "Are you sure you want to delete this lesson content?"
                        );
                        if (!ok) return;
                        try {
                          await callDeleteLessonDetail(lessonDetailId);
                          setLessonDetailId(null);
                          setGrammar("");
                          setVocab("");
                          setPhonetic("");
                          toast.success("Lesson content successfully deleted");
                        } catch (e) {
                          console.error("Failed to delete lesson detail", e);
                          toast.error("Failed to delete lesson content");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Content
                    </Button>
                  ) : null}
                </div>
                <Textarea
                  value={grammar}
                  onChange={(e) => setGrammar(e.target.value)}
                  placeholder="Write grammar notes...

Ví dụ:
- Câu giới thiệu: My name is + [tên]
- Câu hỏi: What is your name?
- Cấu trúc: I am + [tuổi] years old" // Keeping Vietnamese examples for context
                  className="mt-2 min-h-48 text-base leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Vocabulary
                </Label>
                <Textarea
                  value={vocab}
                  onChange={(e) => setVocab(e.target.value)}
                  placeholder="Write vocabulary content...

Ví dụ:
- Hello: xin chào
- Name: tên
- Nice: vui, tốt
- Meet: gặp" // Keeping Vietnamese examples for context
                  className="mt-2 min-h-48 text-base leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  🔊 Phonetic
                </Label>
                <Textarea
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  placeholder="Write phonetic notes...

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
              Cancel
            </Button>
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleSave}
            >
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonsManagement;