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
              ? rawAnswers.map((a: any) => a.content ?? a.text ?? "")
              : [];
            let correctIndex = -1;
            if (Array.isArray(rawAnswers)) {
              correctIndex = rawAnswers.findIndex((a: any) => !!a.isCorrect);
            }
            if (correctIndex === -1) correctIndex = 0;
            return {
              id: q._id ?? q.id ?? qIndex,
              question: q.content ?? q.text ?? "",
              options,
              correctAnswer: correctIndex,
            };
          })
          : [];
        setGame({
          id: raw._id ?? raw.id,
          title: raw.name ?? raw.title ?? "Untitled Game",
          description: raw.description ?? "",
          totalQuestions: mappedQuestions.length,
          questions: mappedQuestions,
        });
        setCurrentQuestion(0);
        setSelectedAnswer("");
        setScore(0);
        setShowResult(false);
        setAnswers([]);

        // Tăng timesPlayed khi load game (bắt đầu chơi)
        await callStartPlayGame(id);
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

  const currentQ = game?.questions?.[currentQuestion] ?? { question: "", options: [], correctAnswer: 0 };
  const progress = ((currentQuestion + 1) / (game?.totalQuestions ?? 1)) * 100;

  const handleSubmitAnswer = () => {
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
    if (isCorrect) {
      setScore(score + 1);
    }
    setAnswers([...answers, isCorrect]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < game.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      // Game finished
      toast({
        title: "Hoàn thành!",
        description: `Bạn đã trả lời đúng ${score + (answers[answers.length - 1] ? 1 : 0)}/${game.totalQuestions} câu hỏi.`,
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setAnswers([]);
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
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                    disabled={showResult}
                  >
                    {currentQ.options.map((option: string, index: number) => {
                      const isCorrect = index === currentQ.correctAnswer;
                      const isSelected = parseInt(selectedAnswer) === index;
                      let bgColor = "bg-muted/50";
                      if (showResult) {
                        if (isCorrect) {
                          bgColor = "bg-primary/20 border-2 border-primary";
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
                            {option}
                          </Label>
                          {showResult && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {!showResult ? (
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handleSubmitAnswer}
                    >
                      Kiểm tra đáp án
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {answers[answers.length - 1] ? (
                        <div className="p-4 bg-primary/10 rounded-xl text-center">
                          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="font-semibold text-primary">Chính xác! Tuyệt vời!</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-destructive/10 rounded-xl text-center">
                          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                          <p className="font-semibold text-destructive">Chưa đúng. Hãy thử lại!</p>
                        </div>
                      )}
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full"
                        onClick={handleNextQuestion}
                      >
                        {currentQuestion < game.totalQuestions - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                      </Button>
                    </div>
                  )}
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