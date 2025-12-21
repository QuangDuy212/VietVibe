import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { callGetGameDetail, callStartPlayGame, callCreatePoint } from "@/config/api";
import { IBackendRes } from "@/types/common.type";

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [game, setGame] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = (await callGetGameDetail(id)) as unknown as IBackendRes<any>;
        const raw = res?.data ?? null;
        if (!raw) {
          setGame(null);
          return;
        }
        const rawQuestions = raw.questions ?? raw.questionList ?? raw.gameQuestions ?? [];
        const mappedQuestions = Array.isArray(rawQuestions)
          ? rawQuestions.map((q: any, qIndex: number) => {
            const rawAnswers = q.answers ?? q.answerList ?? q.answerDTOs ?? [];
            const options = Array.isArray(rawAnswers)
              ? rawAnswers.map((a: any) => ({
                id: String(a.id ?? a._id ?? ""),
                content: a.content ?? a.text ?? "",
                isCorrect: !!a.isCorrect,
                orderIndex: typeof a.orderIndex === 'number' ? a.orderIndex : null,
                isSelected: false, // Thêm trường này để track đáp án đã được chọn
              }))
              : [];
            // For multiple choice, find index of correct; for sentence order, prepare correctOrder
            let correctIndex = -1;
            let correctOrder: string[] | null = null;
            if (Array.isArray(rawAnswers)) {
              correctIndex = rawAnswers.findIndex((a: any) => !!a.isCorrect);
              // build correct order if orderIndex present
              if (rawAnswers.every((a: any) => typeof a.orderIndex === 'number')) {
                correctOrder = rawAnswers
                  .slice()
                  .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                  .map((a: any) => String(a.id ?? a._id ?? ""));
              }
            }
            if (correctIndex === -1) correctIndex = 0;
            return {
              id: q._id ?? q.id ?? qIndex,
              question: q.content ?? q.text ?? "",
              options,
              correctAnswer: correctIndex,
              correctOrder,
            };
          })
          : [];
        setGame({
          id: raw._id ?? raw.id,
          title: raw.name ?? raw.title ?? "Untitled Game",
          description: raw.description ?? "",
          totalQuestions: mappedQuestions.length,
          questions: mappedQuestions,
          type: raw.type ?? raw.gameType ?? null,
        });
        setCurrentQuestion(0);
        setSelectedAnswer("");
        setScore(0);
        setShowResult(false);
        setAnswers([]);

        // Tăng timesPlayed khi load game (bắt đầu chơi)
        // await callStartPlayGame(id);
      } catch (error) {
        console.error("Error loading game detail:", error);
        toast({ title: "Lỗi tải game", description: "Không thể tải dữ liệu game." });
        setGame(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentQ = game?.questions?.[currentQuestion] ?? { question: "", options: [], correctAnswer: 0, correctOrder: null };
  const progress = ((currentQuestion + 1) / (game?.totalQuestions ?? 1)) * 100;

  const handleSubmitAnswer = (val?: string) => {
    const sel = val ?? selectedAnswer;
    if (!sel) {
      toast({
        title: "Chưa chọn đáp án",
        description: "Vui lòng chọn một đáp án trước khi tiếp tục.",
        variant: "destructive",
      });
      return;
    }
    if (showResult) return;
    const answerIndex = parseInt(sel);
    const isCorrect = answerIndex === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setAnswers(prev => [...prev, isCorrect]);
    setSelectedAnswer(sel);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!showResult) {
      // If SENTENCE_ORDER compare the selected options order with correctOrder
      if (game?.type === 'SENTENCE_ORDER') {
        const selectedOptions = currentQ.options.filter((o: any) => o.isSelected);
        const userOrder = selectedOptions.map((o: any) => String(o.id ?? ""));
        const correctOrder = (currentQ.correctOrder ?? []).map((id: any) => String(id ?? ""));
        const isCorrect =
          userOrder.length === correctOrder.length &&
          userOrder.every((v: string, i: number) => v === correctOrder[i]);

        if (isCorrect) setScore((prev) => prev + 1);
        setAnswers((prev) => [...prev, isCorrect]);
        setShowResult(true);
        return;
      }
      // Default (multiple choice)
      if (!selectedAnswer) {
        toast({
          title: "Chưa chọn đáp án",
          description: "Vui lòng chọn một đáp án trước khi tiếp tục.",
          variant: "destructive",
        });
        return;
      }
      const answerIndex = parseInt(selectedAnswer);
      const isCorrect = answerIndex === currentQ.correctAnswer;
      if (isCorrect) setScore(prev => prev + 1);
      setAnswers(prev => [...prev, isCorrect]);
      setShowResult(true);
      return;
    }
    // showResult === true => advance
    if (currentQuestion < game.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      // Game finished
      toast({
        title: "Hoàn thành!",
        description: `Bạn đã trả lời đúng ${score}/${game.totalQuestions} câu hỏi.`,
      });
    }
  };

  const handleRestart = () => {
    if (game) {
      // Reset isSelected cho tất cả options
      const resetQuestions = game.questions.map((q: any) => ({
        ...q,
        options: q.options.map((opt: any) => ({
          ...opt,
          isSelected: false
        }))
      }));

      setGame(prev => ({ ...prev, questions: resetQuestions }));
      setCurrentQuestion(0);
      setSelectedAnswer("");
      setScore(0);
      setShowResult(false);
      setAnswers([]);
    }
  };

  const isGameFinished = currentQuestion === game?.totalQuestions - 1 && showResult;

  useEffect(() => {
    if (isGameFinished) {
      // Tạo point khi finish
      const createPoint = async () => {
        const correctAnswers = answers.filter(a => a).length;
        const totalQuestions = game.totalQuestions;
        const calcScore = correctAnswers * 10;  // Ví dụ tính score
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const userId = payload.user.id;
          await callCreatePoint({
            userId,
            gameId: +game.id,
            score: calcScore,
            correctAnswers,
            totalQuestions,
          });
        }
      };
      createPoint();
    }
  }, [isGameFinished, answers, game]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/games")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        {loading ? (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">Đang tải dữ liệu game...</CardContent>
          </Card>
        ) : !game ? (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">Game không tồn tại.</CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl">{game.title}</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-0">
                    <Trophy className="h-3 w-3 mr-1" />
                    {score}/{game.totalQuestions}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Câu hỏi {currentQuestion + 1}/{game.totalQuestions}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
            </Card>
            {!isGameFinished ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {game?.type === 'SENTENCE_ORDER' ? (
                    <div className="space-y-6">
                      {/* Khu vực hiển thị đáp án đã chọn (ô vuông ở trên) */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[120px] bg-gray-50/50">
                        <Label className="block text-sm font-medium text-gray-700 mb-3">
                          Thứ tự sắp xếp của bạn:
                        </Label>
                        <div className="flex flex-wrap gap-3 min-h-[60px]" id="selected-answers-area">
                          {(() => {
                            // Tìm các đáp án đã được chọn (đã di chuyển lên trên)
                            const selectedOptions = currentQ.options.filter((opt: any) => opt.isSelected);
                            if (selectedOptions.length === 0) {
                              return (
                                <div className="w-full text-center py-4 text-gray-400 italic">
                                  Chọn các đáp án bên dưới để sắp xếp
                                </div>
                              );
                            }
                            return selectedOptions.map((opt: any, idx: number) => (
                              <button
                                key={opt.id ?? idx}
                                type="button"
                                onClick={() => {
                                  if (showResult) return;
                                  // Khi bấm vào đáp án đã chọn, trả về nhóm đáp án bên dưới
                                  // và loại khỏi thứ tự đang sắp xếp
                                  const remainingSelected = currentQ.options.filter(
                                    (o: any) => o.isSelected && o.id !== opt.id
                                  );
                                  const remainingUnselected = currentQ.options.filter(
                                    (o: any) => !o.isSelected || o.id === opt.id
                                  );

                                  const newOptions = [
                                    ...remainingSelected.map((o: any) =>
                                      o.id === opt.id ? { ...o, isSelected: false } : o
                                    ),
                                    ...remainingUnselected.map((o: any) =>
                                      o.id === opt.id ? { ...o, isSelected: false } : o
                                    ),
                                  ];

                                  const newQuestions = [...game.questions];
                                  newQuestions[currentQuestion] = {
                                    ...currentQ,
                                    options: newOptions,
                                  };
                                  setGame((prev) => ({ ...prev, questions: newQuestions }));
                                }}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${showResult
                                  ? 'bg-gray-100 cursor-not-allowed border border-gray-300'
                                  : 'bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200 shadow-sm'
                                  }`}
                              >
                                <span className="text-gray-800">{opt.content}</span>
                                {!showResult && (
                                  <XCircle className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                                )}
                              </button>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Khu vực chứa đáp án gốc (ô vuông ở dưới) */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-3">
                          Các đáp án có sẵn:
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {currentQ.options
                            .filter((opt: any) => !opt.isSelected)
                            .map((opt: any, idx: number) => (
                              <button
                                key={opt.id ?? idx}
                                type="button"
                                onClick={() => {
                                  if (showResult) return;
                                  // Khi chọn đáp án, thêm vào cuối thứ tự sắp xếp hiện tại
                                  const alreadySelected = currentQ.options.filter(
                                    (o: any) => o.isSelected && o.id !== opt.id
                                  );
                                  const remaining = currentQ.options.filter(
                                    (o: any) => !o.isSelected && o.id !== opt.id
                                  );

                                  const picked = { ...opt, isSelected: true };

                                  const newOptions = [
                                    ...alreadySelected,
                                    picked,
                                    ...remaining,
                                  ];

                                  const newQuestions = [...game.questions];
                                  newQuestions[currentQuestion] = {
                                    ...currentQ,
                                    options: newOptions,
                                  };
                                  setGame((prev) => ({ ...prev, questions: newQuestions }));
                                }}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${showResult
                                  ? 'bg-gray-100 cursor-not-allowed border border-gray-300'
                                  : 'bg-white hover:bg-gray-50 cursor-pointer border border-gray-300 shadow-sm hover:shadow-md'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-800">{opt.content}</span>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedAnswer}
                      onValueChange={setSelectedAnswer}
                      disabled={showResult}
                    >
                      {currentQ.options.map((option: any, index: number) => {
                        const isCorrect = index === currentQ.correctAnswer || option.isCorrect;
                        const isSelected = parseInt(selectedAnswer) === index;
                        let bgColor = "bg-muted/50";
                        if (showResult) {
                          if (isCorrect) {
                            bgColor = "bg-green-50 border-2 border-green-500";
                          } else if (isSelected && !isCorrect) {
                            bgColor = "bg-destructive/20 border-2 border-destructive";
                          }
                        }
                        return (
                          <div key={index} className={`flex items-center space-x-3 p-4 rounded-xl ${bgColor} transition-all`}>
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer font-medium"
                            >
                              {option.content ?? option}
                            </Label>
                            {showResult && isCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                  <div className="space-y-4">
                    {showResult && (
                      <div className={`p-4 rounded-xl text-center ${answers[answers.length - 1]
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {answers[answers.length - 1] ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <p className="font-semibold text-green-700">Chính xác!</p>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-600" />
                              <p className="font-semibold text-red-700">Chưa đúng!</p>
                            </>
                          )}
                        </div>
                        {!answers[answers.length - 1] && currentQ.correctOrder && game?.type === 'SENTENCE_ORDER' && (
                          <div className="text-sm text-gray-600 mt-2">
                            <p className="font-medium mb-1">Thứ tự đúng là:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {currentQ.correctOrder.map((id: any, idx: number) => {
                                const correctOption = currentQ.options.find((opt: any) => opt.id === id);
                                if (!correctOption) return null;
                                return (
                                  <div key={id} className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                                    {correctOption.content}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant={showResult ? "default" : "gradient"}
                      size="lg"
                      className="w-full"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestion < game.totalQuestions - 1
                        ? "Câu tiếp theo"
                        : showResult
                          ? "Xem kết quả"
                          : "Kiểm tra kết quả"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
                  <p className="text-muted-foreground mb-6">
                    Bạn đã trả lời đúng {score}/{game.totalQuestions} câu hỏi
                  </p>
                  <div className="mb-6 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
                    <p className="text-4xl font-bold text-primary mb-2">
                      {Math.round((score / game.totalQuestions) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Độ chính xác</p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handleRestart}
                    >
                      Chơi lại
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate("/games")}
                    >
                      Về trang Games
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default GameDetail;