import { useEffect, useState } from "react";
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
import { callGetGameDetail } from "@/config/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    callGetGameDetail(id)
      .then((res) => {
        // axios-customize interceptor returns `res.data` (the backend envelope),
        // so `res` here is the backend envelope: { message, statusCode, data }
        const envelope = res as any;
        const g = envelope.data as any;
        if (!g) {
          setError("Không tìm thấy game");
          return;
        }
        // Map backend questions to UI shape
        const mappedQuestions = (g.questions || []).map((q: any, idx: number) => ({
          id: q._id || idx,
          question: q.content,
          options: (q.answers || []).map((a: any) => a.content || a),
          correctAnswer: (q.answers || []).findIndex((a: any) => a.isCorrect || a.correct === true),
        }));

        setGame({
          id: g._id,
          title: g.name,
          description: g.description,
          totalQuestions: mappedQuestions.length,
          questions: mappedQuestions,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || "Lỗi khi tải chi tiết game");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">{error}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-8">Không có dữ liệu.</div>
      </div>
    );
  }

  const currentQ = game.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / game.totalQuestions) * 100;

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

  const isGameFinished = currentQuestion === game.totalQuestions - 1 && showResult;

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

        {/* Game Header */}
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
          /* Question Card */
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
                {currentQ.options.map((option, index) => {
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
          /* Results Card */
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
      </div>
    </div>
  );
};

export default GameDetail;
