import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  callCreateLesson,
  callUpdateLesson,
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
import { ILesson } from "@/types/common.type";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, ChevronLeft, Save, Video, Upload, X, FileText } from "lucide-react";

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
}

interface UpdateLessonProps {
  mode: "create" | "edit" | "view";
  lesson: ILesson | null;
  onBack: () => void;
}

const UpdateLesson = ({ mode, lesson, onBack }: UpdateLessonProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";

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
  const [time, setTime] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lesson && !isCreate) {
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

          const vocabData = vocabRes?.data || [];
          const transformedVocab: Vocabulary[] = (
            Array.isArray(vocabData) ? vocabData : []
          ).map((item: any) => ({
            id: item._id || `vocab-${Date.now()}`,
            word: item.word,
            meaning: item.englishMeaning,
            example: item.exampleSentence,
          }));
          setVocabularies(transformedVocab);

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
    }
  }, [lesson, isCreate]);

  const addVocabulary = () => {
    setVocabularies([...vocabularies, { id: `new-${Date.now()}`, word: "", meaning: "", example: "" }]);
  };

  const updateVocab = (id: string, field: keyof Vocabulary, value: string) => {
    setVocabularies(vocabularies.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const deleteVocab = (id: string) => {
    if (id.startsWith("new-")) {
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
      return;
    }
    setRemovedVocabIds((prev) => [...prev, id]);
    setVocabularies((prev) => prev.filter((v) => v.id !== id));
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
    if (isView) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        setFormData((prev) => ({ ...prev, videourl: "" }));
      } else {
        toast.error("Please upload a video file");
      }
    }
  }, [isView]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        setFormData((prev) => ({ ...prev, videourl: "" }));
      } else {
        toast.error("Please upload a video file");
      }
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setFormData((prev) => ({ ...prev, videourl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const res = await callUploadFile(file, "video");
      setTime(res.data.durationFormatted);
      setDurationSeconds(res.data.durationSeconds);
      return res.data.fileName;
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.lessontitle.trim()) {
      toast.error("Please enter a lesson title");
      return;
    }

    try {
      const lessonPayload = {
        lessontitle: formData.lessontitle,
        videourl: formData.videourl,
        description: formData.description,
        level: formData.level,
        time: time,
        durationSeconds: durationSeconds,
      };

      if (videoFile) {
        const uploadedUrl = await uploadVideo(videoFile);
        if (uploadedUrl) {
          lessonPayload.videourl = uploadedUrl;
        } else {
          return;
        }
      }

      if (!isCreate && lesson) {
        // UPDATE MODE
        const res = await callUpdateLesson(lesson._id, lessonPayload);
        if (res && res.statusCode && Number(res.statusCode) >= 400) {
            toast.error(res.message || "Failed to update lesson");
            return;
        }

        // Upsert lesson detail
        if (lessonDetailId) {
          try {
            await callUpdateLessonDetail(lessonDetailId, { gramma: grammar, vocab, phonetic, lessonId: lesson._id });
          } catch (e) { toast.error("Failed to update lesson content"); }
        } else {
          try {
            const createDetailRes = await callCreateLessonDetail({ gramma: grammar, vocab, phonetic, lessonId: lesson._id });
            if (createDetailRes?.data?.data?._id) setLessonDetailId(createDetailRes.data.data._id);
          } catch (e) { toast.error("Failed to save lesson content"); }
        }

        // Delete removed vocabularies
        for (const vid of removedVocabIds) {
          try { await callDeleteVocabulary(vid); } catch (e) { toast.error(`Failed to delete vocabulary ${vid}`); }
        }

        // Create new vocabularies
        const newVocs = vocabularies.filter((v) => v.id.startsWith("new-")).map((v) => ({
          word: v.word, englishMeaning: v.meaning, exampleSentence: v.example, lessonId: lesson._id,
        }));

        if (newVocs.length) {
          const validNewVocs = newVocs.filter((v) => v.word && v.englishMeaning);
          try {
            await callCreateVocabulariesBatch(validNewVocs);
          } catch (e) {
            for (const nv of validNewVocs) {
              try { await callCreateVocabulary(nv); } catch (err) {}
            }
            toast.error("Failed to create some new vocabulary items");
          }
        }

        // Update existing vocabularies
        const existingVocs = vocabularies.filter((v) => !v.id.startsWith("new-"));
        for (const v of existingVocs) {
          try {
            await callUpdateVocabulary(v.id, { word: v.word, englishMeaning: v.meaning, exampleSentence: v.example, lessonId: lesson._id });
          } catch (e) { toast.error(`Failed to update word ${v.word}`); }
        }

        toast.success("Changes saved successfully!");
      } else {
        // CREATE MODE
        const res = await callCreateLesson(lessonPayload as any);
        if (res && res.statusCode && Number(res.statusCode) >= 400) {
            toast.error(res.message || "Failed to create lesson");
            return;
        }

        const createdLesson = (res?.data?.data ?? res?.data) as any;
        const lessonId = createdLesson?._id || createdLesson?.id || createdLesson?.lessonId;

        if (lessonId) {
          try {
            await callCreateLessonDetail({ gramma: grammar, vocab, phonetic, lessonId });
          } catch (e) { toast.error("Failed to save lesson content"); }

          const validVocs = vocabularies.filter((v) => v.word.trim() && v.meaning.trim()).map((v) => ({
            word: v.word, englishMeaning: v.meaning, exampleSentence: v.example, lessonId,
          }));

          if (validVocs.length) {
            try {
              await callCreateVocabulariesBatch(validVocs);
            } catch (e) {
              for (const vv of validVocs) {
                try { await callCreateVocabulary(vv); } catch (err) {}
              }
            }
          }
        }
        toast.success("Lesson created successfully!");
      }

      onBack();
    } catch (error) {
      toast.error("An error occurred!");
    }
  };

  if (!lesson && !isCreate) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lesson Not Found</h2>
        <p className="text-gray-500 mb-6">The lesson you are looking for does not exist or has been deleted.</p>
        <Button onClick={onBack}>Go Back to Lessons</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isCreate ? "Create New Lesson" : isView ? "View Lesson" : "Edit Lesson"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {isCreate ? "Add a new lesson to the system" : isView ? "Viewing lesson details" : "Modify lesson content"}
            </p>
          </div>
        </div>
        {!isView && (
          <Button onClick={handleSave} className="gap-2 px-6 rounded-xl bg-red-500 hover:bg-red-600">
            <Save className="w-4 h-4" />
            {isCreate ? "Create Lesson" : "Save Changes"}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 rounded-full bg-muted p-1">
          <TabsTrigger value="info" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow text-sm">
            Information
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow text-sm">
            Vocabulary ({vocabularies.length})
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow text-sm">
            Content Details
          </TabsTrigger>
        </TabsList>

        <Card className="rounded-xl border-gray-200 shadow-sm mt-6">
          <CardContent className="pt-6">
            <TabsContent value="info" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Level*</Label>
                  <Select value={formData.level} onValueChange={(e) => setFormData({ ...formData, level: e })} disabled={isView}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose lesson level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCE">Advance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lesson Title *</Label>
                  <Input value={formData.lessontitle} onChange={(e) => setFormData({ ...formData, lessontitle: e.target.value })} placeholder="E.g.: Unit 1 - Greetings" disabled={isView} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  } ${videoFile || formData.videourl ? "p-4" : "p-8"}`}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                >
                  {!isView && <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" id="video-upload" />}

                  {videoFile ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      {!isView && (
                        <Button type="button" variant="ghost" size="icon" onClick={removeVideo} className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : formData.videourl ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Current Video</p>
                        <p className="text-sm text-muted-foreground truncate">{formData.videourl}</p>
                      </div>
                      {!isView && (
                        <Button type="button" variant="ghost" size="icon" onClick={removeVideo} className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label htmlFor={isView ? "" : "video-upload"} className={`flex flex-col items-center justify-center ${!isView ? "cursor-pointer" : ""}`}>
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Drag and drop video here</p>
                      <p className="text-xs text-muted-foreground">or <span className="text-primary underline">click to browse</span></p>
                    </label>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Learn how to greet and introduce yourself" disabled={isView} className="min-h-32" />
              </div>
            </TabsContent>

            <TabsContent value="vocabulary" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vocabulary List</h3>
                {!isView && (
                  <Button onClick={addVocabulary} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add New Word
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {vocabularies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">No vocabulary yet.</div>
                ) : (
                  vocabularies.map((v) => (
                    <div key={v.id} className="flex flex-col sm:flex-row items-center gap-3">
                      <Input value={v.word} onChange={(e) => updateVocab(v.id, "word", e.target.value)} placeholder="Word" disabled={isView} className="font-medium" />
                      <Input value={v.meaning} onChange={(e) => updateVocab(v.id, "meaning", e.target.value)} placeholder="Meaning" disabled={isView} />
                      <Input value={v.example} onChange={(e) => updateVocab(v.id, "example", e.target.value)} placeholder="Example" disabled={isView} />
                      {!isView && (
                        <Button size="icon" variant="ghost" onClick={() => deleteVocab(v.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Grammar</Label>
                <Textarea value={grammar} onChange={(e) => setGrammar(e.target.value)} disabled={isView} placeholder="Write grammar notes..." className="min-h-40 leading-relaxed" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" /> Vocabulary Details</Label>
                <Textarea value={vocab} onChange={(e) => setVocab(e.target.value)} disabled={isView} placeholder="Write vocabulary content..." className="min-h-40 leading-relaxed" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">🔊 Phonetic</Label>
                <Textarea value={phonetic} onChange={(e) => setPhonetic(e.target.value)} disabled={isView} placeholder="Write phonetic notes..." className="min-h-40 leading-relaxed" />
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {!isCreate && (
        <Card className="rounded-xl border-gray-200 shadow-sm md:col-span-2 mt-6">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base">System Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Lesson ID</p>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded-md border text-gray-600">{lesson?._id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm bg-gray-50 p-2 rounded-md border text-gray-600">{lesson?.createdAt ? new Date(lesson.createdAt).toLocaleString() : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm bg-gray-50 p-2 rounded-md border text-gray-600">{lesson?.updatedAt ? new Date(lesson.updatedAt).toLocaleString() : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpdateLesson;
