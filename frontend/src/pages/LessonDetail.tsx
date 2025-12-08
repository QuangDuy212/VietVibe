// LessonDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { 
  ILesson,
  ICurrentLesson
} from '@/types/common.type'; 
import { callFetchLessonsPaginated, callFetchLessonDetail, callFetchVocbulary } from "@/config/api"; 


const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentLesson, setCurrentLesson] = useState<ICurrentLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Fetch lesson data on component mount
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch paginated lessons to get current lesson with embedded vocabulary & details
        const lessonRes = await callFetchLessonsPaginated(1, 100);
        const lessons: ILesson[] = lessonRes?.data?.result || [];
        const foundLesson = lessons.find(l => l._id === id);
        
        if (!foundLesson) {
          setLoading(false);
          return;
        }

        // Fetch lesson details and vocabulary for sections data
        const [detailRes, vocabRes] = await Promise.all([
          callFetchLessonDetail(id),
          callFetchVocbulary(id),
        ]);
        
        // Ensure detailData is correctly extracted from the API response
        const detailData = detailRes?.data || {}; // Adjusted to match the API response structure

        const sections = [
          {
            id: 1,
            title: "Ngữ pháp",
            duration: "3 phút",
            progressThreshold: 33,
            content: detailData.gramma || "Không có dữ liệu", // Ensure fallback value
          },
          {
            id: 2,
            title: "Từ vựng",
            duration: "5 phút",
            progressThreshold: 66,
            content: detailData.vocab || "Không có dữ liệu", // Ensure fallback value
          },
          {
            id: 3,
            title: "Ngữ âm",
            duration: "7 phút",
            progressThreshold: 100,
            content: detailData.phonetic || "Không có dữ liệu", // Ensure fallback value
          },
        ];
        
        // Transform vocabulary from API response to simplified format for display
        // No need to filter - API already returns data for this lesson only
        const allVocab = vocabRes?.data || [];
        const simplifiedVocabulary = (Array.isArray(allVocab) ? allVocab : [])
          .map(item => ({
            word: item.word,
            meaning: item.englishMeaning, 
            example: item.exampleSentence || "Không có ví dụ",
          }));
        
        // Calculate section completion based on current progress
        const sectionsWithCompletion = sections.map(section => ({
          ...section,
          completed: (progress || 0) >= section.progressThreshold,
        }));
        
        // Set combined lesson data
        setCurrentLesson({
          ...foundLesson, 
          sections: sectionsWithCompletion,
          simplifiedVocabulary,
          details: null,
        });

      } catch (error) {
        console.error("Error fetching lesson data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id, progress]);

  // Update progress locally
  const handleContinueLesson = () => {
    const newProgress = Math.min(100, progress + 20);
    setProgress(newProgress);
  };

  const handleCompleteLesson = () => {
    setProgress(100);
  };

  // Show loading state
  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading lesson...</div>
      </div>
    );
  }

  // JSX/Rendering
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/lesson")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{currentLesson.lessontitle}</CardTitle>
                    <p className="text-muted-foreground">{currentLesson.description}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0">Beginner</Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">15 phút</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tiến độ</span>
                      <span className="text-sm">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-2xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentLesson.videourl}
                    title={currentLesson.lessontitle}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full"
                    onClick={handleContinueLesson}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {progress === 100 ? "Review Lesson" : "Continue Learning"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Từ vựng trong bài</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.simplifiedVocabulary?.length > 0 ? (
                  currentLesson.simplifiedVocabulary.map((item, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{item.word}</h4>
                          <p className="text-sm text-muted-foreground">{item.meaning}</p>
                        </div>
                      </div>
                      <p className="text-sm italic mt-2">
                        Ví dụ: <span className="font-medium">{item.example}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Không tìm thấy từ vựng cho bài học này.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung bài học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentLesson.sections?.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    {section.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.duration}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(section as any).content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">
                  {progress === 100 ? "Hoàn thành!" : "Hoàn thành bài học"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {progress === 100 
                    ? "Bạn đã hoàn thành bài học này!" 
                    : "Làm quiz để kiểm tra kiến thức"
                  }
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={progress === 100 ? undefined : handleCompleteLesson}
                  disabled={progress === 100}
                >
                  {progress === 100 ? "Đã hoàn thành" : "Làm bài kiểm tra"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;




