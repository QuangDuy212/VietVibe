import React, { useState, useEffect } from "react";
import {
  callCreateGame,
  callUpdateGame,
  callGetGameDetail,
  callUploadFile,
} from "@/config/api";
import { IBackendRes, IGame, IQuestion, IAnswer } from "@/types/common.type";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, Plus, Save, Trash2, X, Upload, Music, Image as ImageIcon, Loader2, ChevronDown, ChevronRight, GripVertical, Check } from "lucide-react";

interface UpdateGameProps {
  mode: "create" | "edit" | "view";
  game: IGame | null;
  onBack: () => void;
}

const UpdateGame = ({ mode, game, onBack }: UpdateGameProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const canEdit = isCreate || isEdit;

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [currentGame, setCurrentGame] = useState<IGame>({
    _id: "",
    name: "",
    description: "",
    type: "MULTIPLE_CHOICE",
    questions: [],
  });

  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [collapsedQuestions, setCollapsedQuestions] = useState<Record<number, boolean>>({});

  const toggleQuestionCollapse = (qIndex: number) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex],
    }));
  };

  const getCorrectAnswerLabel = (q: IQuestion) => {
    if (currentGame.type === "SENTENCE_ORDER") {
      return "Order";
    }
    const correctIdx = q.answers?.findIndex((a) => a.isCorrect);
    if (correctIdx !== undefined && correctIdx !== -1) {
      const char = String.fromCharCode(65 + correctIdx);
      return `${char}`;
    }
    return "";
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragEnabled, setDragEnabled] = useState<boolean>(false);

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      const [draggedItem] = questions.splice(fromIndex, 1);
      questions.splice(toIndex, 0, draggedItem);

      // Adjust collapse state map correspondingly
      setCollapsedQuestions((prevCollapsed) => {
        const nextCollapsed = { ...prevCollapsed };
        const temp = nextCollapsed[fromIndex];
        nextCollapsed[fromIndex] = nextCollapsed[toIndex];
        nextCollapsed[toIndex] = temp;
        return nextCollapsed;
      });

      return { ...prev, questions };
    });
  };

  const handleUploadFile = async (
    qIndex: number,
    field: "imageUrl" | "audioUrl",
    file: File
  ) => {
    const key = `${qIndex}-${field}`;
    setUploadingState((prev) => ({ ...prev, [key]: true }));
    try {
      const folderType = field === "imageUrl" ? "image" : "audio";
      const res = await callUploadFile(file, folderType);
      if (res?.data?.fileName) {
        updateQuestionField(qIndex, field, res.data.fileName);
        toast.success(`Uploaded ${field === "imageUrl" ? "image" : "audio"} successfully`);
      } else {
        toast.error(`Failed to upload ${field === "imageUrl" ? "image" : "audio"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`An error occurred while uploading ${field === "imageUrl" ? "image" : "audio"}`);
    } finally {
      setUploadingState((prev) => ({ ...prev, [key]: false }));
    }
  };

  const isAnyFileUploading = Object.values(uploadingState).some(Boolean);

  useEffect(() => {
    if (isCreate) {
      setCurrentGame({
        _id: "",
        name: "",
        description: "",
        type: "MULTIPLE_CHOICE",
        questions: [],
      });
      setLoading(false);
    } else if (game?._id) {
      fetchGameDetail(game._id);
    }
  }, [mode, game]);

  const fetchGameDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = (await callGetGameDetail(id)) as unknown as IBackendRes<IGame>;

      if (res.data) {
        const raw = res.data as any;
        const rawQuestions = raw.questions ?? raw.questionList ?? raw.gameQuestions ?? [];
        
        const questions: IQuestion[] = Array.isArray(rawQuestions)
          ? rawQuestions.map((q: any): IQuestion => {
              const rawAnswers = q.answers ?? q.answerList ?? q.answerDTOs ?? [];
              const answers: IAnswer[] = Array.isArray(rawAnswers)
                ? rawAnswers.map((a: any): IAnswer => {
                    const content = a.content ?? a.text ?? a.answerContent ?? "";
                    const boolIsCorrect = !!a.isCorrect;
                    let orderIndex: number | undefined = undefined;
                    if (typeof a.orderIndex === "number") orderIndex = a.orderIndex;
                    else if (typeof a.order === "number") orderIndex = a.order;
                    else if (typeof a.index === "number") orderIndex = a.index;
                    else if (a.orderIndex != null) orderIndex = Number(a.orderIndex);
                    else if (a.order != null) orderIndex = Number(a.order);
                    else if (a.index != null) orderIndex = Number(a.index);

                    return { _id: a._id, content, isCorrect: boolIsCorrect, orderIndex };
                  })
                : [];

              return {
                _id: q._id,
                content: q.content ?? q.text ?? "",
                imageUrl: q.imageUrl,
                audioUrl: q.audioUrl,
                answers,
              };
            })
          : [];

        setCurrentGame({
          _id: raw._id,
          name: raw.name,
          description: raw.description,
          type: raw.type,
          questions,
        });
      } else {
        toast.error("Game not found");
      }
    } catch (error) {
      console.error("Error loading game detail:", error);
      toast.error("Failed to load game detail");
    } finally {
      setLoading(false);
    }
  };

  const updateGameField = (field: keyof IGame, value: any) => {
    if (!canEdit) return;
    setCurrentGame((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      let defaultAnswers: IAnswer[] = [];

      if (prev.type === "MULTIPLE_CHOICE" || prev.type === "LISTENING_CHOICE") {
        defaultAnswers = [0, 1, 2, 3].map((index) => ({ content: "", isCorrect: index === 0 }));
      } else if (prev.type === "SENTENCE_ORDER") {
        defaultAnswers = [{ content: "", orderIndex: 0 }];
      }

      questions.push({
        content: "",
        imageUrl: undefined,
        audioUrl: undefined,
        answers: defaultAnswers,
      });
      return { ...prev, questions };
    });
  };

  const removeQuestion = (qIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      questions.splice(qIndex, 1);
      return { ...prev, questions };
    });
  };

  const updateQuestionField = (qIndex: number, field: keyof IQuestion, value: any) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      questions[qIndex] = { ...questions[qIndex], [field]: value };
      return { ...prev, questions };
    });
  };

  const addAnswer = (qIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      
      const base: IAnswer = { content: "" };
      if (prev.type === "SENTENCE_ORDER") base.orderIndex = 0;
      else base.isCorrect = false;

      answers.push(base);
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      answers.splice(aIndex, 1);
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const updateAnswerField = (qIndex: number, aIndex: number, field: keyof IAnswer, value: any) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      answers[aIndex] = { ...answers[aIndex], [field]: value };
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      const updated = answers.map((ans, idx) => ({ ...ans, isCorrect: idx === aIndex }));
      q.answers = updated;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const handleSaveGame = async () => {
    if (!canEdit) return;
    if (!currentGame.name.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: currentGame.name.trim(),
        description: (currentGame.description || "").trim(),
        type: currentGame.type,
        questions: (currentGame.questions ?? []).map((q) => ({
          content: q.content,
          imageUrl: q.imageUrl,
          audioUrl: q.audioUrl,
          answers: (q.answers ?? []).map((a) => ({
            content: a.content,
            isCorrect: a.isCorrect,
            orderIndex: a.orderIndex,
          })),
        })),
      };

      let res: IBackendRes<IGame>;
      if (isCreate) {
        res = (await callCreateGame(payload)) as unknown as IBackendRes<IGame>;
      } else {
        res = (await callUpdateGame(currentGame._id, payload)) as unknown as IBackendRes<IGame>;
      }

      if (res.error) {
        toast.error(String(res.error));
        return;
      }

      toast.success(isCreate ? "Game created successfully" : "Game updated successfully");
      onBack();
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "SENTENCE_ORDER": return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      case "LISTENING_CHOICE": return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE": return "Multiple choice";
      case "SENTENCE_ORDER": return "Sentence order";
      case "LISTENING_CHOICE": return "Listening choice";
      default: return type;
    }
  };

  const renderTypeDescription = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE": return "Each question has multiple answers, choose exactly one correct answer.";
      case "SENTENCE_ORDER": return "Each question contains sentence parts. Players must arrange them in the correct order.";
      case "LISTENING_CHOICE": return "Each question has an audio URL and one correct choice answer.";
      default: return "";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-gray-500">Loading game details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isCreate ? "Create New Game" : isEdit ? "Edit Game & Questions" : "View Game Detail"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {renderTypeDescription(currentGame.type)}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={handleSaveGame} disabled={saving || isAnyFileUploading} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isAnyFileUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Game Name</Label>
                <Input
                  value={currentGame.name}
                  disabled={!canEdit}
                  onChange={(e) => updateGameField("name", e.target.value)}
                  placeholder="Enter game name"
                />
              </div>

              <div className="space-y-2">
                <Label>Game Type</Label>
                {isCreate ? (
                  <Select
                    value={currentGame.type}
                    onValueChange={(value) => updateGameField("type", value as IGame["type"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose game type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                      <SelectItem value="SENTENCE_ORDER">Sentence order</SelectItem>
                      <SelectItem value="LISTENING_CHOICE">Listening choice</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <Badge className={getTypeColor(currentGame.type)}>
                      {renderTypeLabel(currentGame.type)}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Game type cannot be changed once created.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={currentGame.description}
                  disabled={!canEdit}
                  onChange={(e) => updateGameField("description", e.target.value)}
                  rows={4}
                  placeholder="Enter game description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>Manage the questions and answers for this game.</CardDescription>
              </div>
              {canEdit && (
                <Button size="sm" onClick={addQuestion} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {(currentGame.questions?.length ?? 0) === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 mb-4">No questions added yet.</p>
                  {canEdit && (
                    <Button variant="outline" onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-2" /> Add First Question
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {currentGame.questions?.map((q, qIndex) => {
                    const isCollapsed = collapsedQuestions[qIndex];
                    
                    if (isCollapsed) {
                      const correctLabel = getCorrectAnswerLabel(q);
                      return (
                        <div
                          key={qIndex}
                          draggable={dragEnabled}
                          onDragStart={(e) => {
                            setDraggedIndex(qIndex);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDragEnter={() => {
                            if (draggedIndex !== null && draggedIndex !== qIndex) {
                              reorderQuestions(draggedIndex, qIndex);
                            }
                          }}
                          onDragEnd={() => {
                            setDraggedIndex(null);
                            setDragEnabled(false);
                          }}
                          onClick={() => toggleQuestionCollapse(qIndex)}
                          className={`bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 rounded-2xl py-3.5 px-5 flex flex-row items-center justify-between cursor-pointer select-none gap-4 ${
                            draggedIndex === qIndex ? "opacity-40" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Grip Handle */}
                            <GripVertical
                              onMouseEnter={() => setDragEnabled(true)}
                              onMouseLeave={() => setDragEnabled(false)}
                              className="h-4 w-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing"
                            />
                            
                            {/* Q1, Q2 Pill */}
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                              Q{qIndex + 1}
                            </span>
                            
                            {/* Question text */}
                            <span className={`text-sm truncate flex-1 ${q.content ? "text-gray-700 font-medium" : "text-gray-400 italic"}`}>
                              {q.content || "Enter the question text..."}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Correct Answer badge */}
                            {correctLabel && (
                              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full shrink-0">
                                <Check className="h-3 w-3" />
                                <span>{correctLabel}</span>
                              </div>
                            )}
                            
                            {/* Chevron expand */}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      );
                    }

                    // If expanded
                    return (
                      <Card
                        key={qIndex}
                        draggable={dragEnabled}
                        onDragStart={(e) => {
                          setDraggedIndex(qIndex);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDragEnter={() => {
                          if (draggedIndex !== null && draggedIndex !== qIndex) {
                            reorderQuestions(draggedIndex, qIndex);
                          }
                        }}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                          setDragEnabled(false);
                        }}
                        className={`bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-150 rounded-2xl overflow-hidden ${
                          draggedIndex === qIndex ? "opacity-40" : ""
                        }`}
                      >
                        <CardHeader
                          onClick={() => toggleQuestionCollapse(qIndex)}
                          className="py-4 px-5 border-b border-gray-100 flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors select-none gap-4"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Grip Handle */}
                            <GripVertical
                              onMouseEnter={() => setDragEnabled(true)}
                              onMouseLeave={() => setDragEnabled(false)}
                              className="h-4 w-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing"
                            />
                            
                            {/* Q1, Q2 Pill */}
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                              Q{qIndex + 1}
                            </span>
                            
                            {/* Title */}
                            <span className="text-sm font-semibold text-gray-900 flex-1 truncate">
                              Question {qIndex + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Delete Button */}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuestion(qIndex);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Chevron collapse */}
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          {/* Question Content */}
                          <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Textarea
                              value={q.content}
                              disabled={!canEdit}
                              onChange={(e) => updateQuestionField(qIndex, "content", e.target.value)}
                              placeholder="Enter the question text"
                              rows={2}
                            />
                          </div>

                          {(currentGame.type === "LISTENING_CHOICE") && (
                            <div className="space-y-2">
                              <Label>Audio File *</Label>
                              <div className="relative border border-dashed rounded-lg p-4 border-gray-300 bg-white hover:border-primary/50 transition-all">
                                {uploadingState[`${qIndex}-audioUrl`] ? (
                                  <div className="flex items-center justify-center py-4 space-x-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <span className="text-sm text-gray-500">Uploading audio...</span>
                                  </div>
                                ) : q.audioUrl ? (
                                  <div className="flex items-center justify-between gap-4 w-full">
                                    <div className="flex-1 min-w-0">
                                      <audio
                                        src={
                                          q.audioUrl.startsWith("http")
                                            ? q.audioUrl
                                            : `${import.meta.env.VITE_BACKEND_URL || ""}/api/v1/storage/audio/${q.audioUrl}`
                                        }
                                        controls
                                        className="w-full h-11"
                                      />
                                    </div>
                                    {canEdit && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateQuestionField(qIndex, "audioUrl", undefined)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 h-10 w-10 rounded-full"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      disabled={!canEdit}
                                      id={`audio-upload-${qIndex}`}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadFile(qIndex, "audioUrl", file);
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={canEdit ? `audio-upload-${qIndex}` : undefined}
                                      className={`flex flex-col items-center justify-center py-4 ${
                                        canEdit ? "cursor-pointer" : "opacity-50"
                                      }`}
                                    >
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                                        <Upload className="w-5 h-5 text-gray-500" />
                                      </div>
                                      <p className="text-sm font-medium text-gray-700">
                                        Click to upload audio
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        Supports MP3, WAV, M4A, OGG
                                      </p>
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Image (Optional)</Label>
                            <div className="relative border border-dashed rounded-lg p-4 border-gray-300 bg-white hover:border-primary/50 transition-all">
                              {uploadingState[`${qIndex}-imageUrl`] ? (
                                <div className="flex items-center justify-center py-4 space-x-2">
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                  <span className="text-sm text-gray-500">Uploading image...</span>
                                </div>
                              ) : q.imageUrl ? (
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                      <img
                                        src={
                                          q.imageUrl.startsWith("http")
                                            ? q.imageUrl
                                            : `${import.meta.env.VITE_BACKEND_URL || ""}/api/v1/storage/image/${q.imageUrl}`
                                        }
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="min-w-0 py-1">
                                      <p className="font-medium text-sm truncate text-gray-800">
                                        {q.imageUrl}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">Uploaded image</p>
                                    </div>
                                  </div>
                                  {canEdit && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => updateQuestionField(qIndex, "imageUrl", undefined)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={!canEdit}
                                    id={`image-upload-${qIndex}`}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadFile(qIndex, "imageUrl", file);
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={canEdit ? `image-upload-${qIndex}` : undefined}
                                    className={`flex flex-col items-center justify-center py-4 ${
                                      canEdit ? "cursor-pointer" : "opacity-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                                      <ImageIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                      Click to upload image
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Supports PNG, JPG, JPEG, GIF, WEBP
                                    </p>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Answers */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <Label>Answers</Label>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addAnswer(qIndex)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add Answer
                                </Button>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {q.answers?.map((a, aIndex) => (
                                <div key={aIndex} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex-1 flex items-center gap-3">
                                    <div className="shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                      {aIndex + 1}
                                    </div>
                                    <Input
                                      value={a.content}
                                      disabled={!canEdit}
                                      onChange={(e) => updateAnswerField(qIndex, aIndex, "content", e.target.value)}
                                      placeholder={currentGame.type === "SENTENCE_ORDER" ? "Word/phrase part" : "Answer option"}
                                      className="flex-1"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center gap-3 sm:w-auto w-full justify-between sm:justify-end">
                                    {currentGame.type === "SENTENCE_ORDER" ? (
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs text-gray-500">Order</Label>
                                        <Input
                                          type="number"
                                          disabled={!canEdit}
                                          value={a.orderIndex ?? 0}
                                          onChange={(e) => updateAnswerField(qIndex, aIndex, "orderIndex", Number(e.target.value))}
                                          className="w-16 h-9 text-center"
                                        />
                                      </div>
                                    ) : (
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`q-${qIndex}-correct`}
                                          disabled={!canEdit}
                                          checked={!!a.isCorrect}
                                          onChange={() => setCorrectAnswer(qIndex, aIndex)}
                                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                        />
                                        <span className={`text-sm ${a.isCorrect ? "font-medium text-green-600" : "text-gray-500"}`}>
                                          {canEdit ? "Correct" : a.isCorrect ? "Correct answer" : "Incorrect"}
                                        </span>
                                      </label>
                                    )}
                                    
                                    {canEdit && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAnswer(qIndex, aIndex)}
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {canEdit && (currentGame.questions?.length ?? 0) > 0 && (
                    <Button
                      variant="outline"
                      className="w-full border-dashed"
                      onClick={addQuestion}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Another Question
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdateGame;
