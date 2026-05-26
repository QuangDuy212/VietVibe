import React, { useState, useEffect } from "react";
import {
  callCreateGame,
  callUpdateGame,
  callGetGameDetail,
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
import { ChevronLeft, Plus, Save, Trash2, X } from "lucide-react";

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
          <Button onClick={handleSaveGame} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
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
                  {currentGame.questions?.map((q, qIndex) => (
                    <Card key={qIndex} className="bg-gray-50/50 border-gray-200 shadow-none">
                      <CardHeader className="py-4 px-5 border-b border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          Question {qIndex + 1}
                        </CardTitle>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                            onClick={() => removeQuestion(qIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                            <Label>Audio URL</Label>
                            <Input
                              value={q.audioUrl || ""}
                              disabled={!canEdit}
                              onChange={(e) => updateQuestionField(qIndex, "audioUrl", e.target.value)}
                              placeholder="https://example.com/audio.mp3"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Image URL (Optional)</Label>
                          <Input
                            value={q.imageUrl || ""}
                            disabled={!canEdit}
                            onChange={(e) => updateQuestionField(qIndex, "imageUrl", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
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
                  ))}
                  
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
