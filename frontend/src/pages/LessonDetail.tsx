// LessonDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ILesson, ICurrentLesson } from "@/types/common.type";
import {
  callFetchLessonsPaginated,
  callFetchLessonDetail,
  callFetchVocbulary,
  callSaveProgress,
} from "@/config/api";

const levelColors = {
  BEGINNER: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  INTERMEDIATE: "bg-accent/10 text-accent hover:bg-accent/20",
  ADVANCE: "bg-primary/10 text-primary hover:bg-primary/20",
};
const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentLesson, setCurrentLesson] = useState<ICurrentLesson | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [allLessons, setAllLessons] = useState<ILesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const videoRef = useRef(null);

  // Fetch lesson data on component mount
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch paginated lessons to get current lesson with embedded vocabulary & details
        const lessonRes = await callFetchLessonsPaginated(1, 100);
        const lessons: ILesson[] = lessonRes?.data?.result || [];
        setAllLessons(lessons);

        const index = lessons.findIndex((l) => l._id === id);
        setCurrentIndex(index);

        const foundLesson = lessons[index];

        if (!foundLesson) {
          setLoading(false);
          return;
        }

        // Fetch lesson details and vocabulary for sections data
        // Handle lesson details gracefully if not found
        let detailData: any = {};
        try {
          const detailRes = await callFetchLessonDetail(id);
          detailData = detailRes?.data || {};
        } catch (detailError) {
          // Lesson detail doesn't exist yet, use empty object
          detailData = {};
        }

        // Fetch vocabulary
        const vocabRes = await callFetchVocbulary(id);

        // Ensure detailData is correctly extracted from the API response
        // If detailData is empty, fallback to "No data available"

        const sections = [
          {
            id: 1,
            title: "Grammar",
            progressThreshold: 33,
            content: detailData.gramma || "No data available",
          },
          {
            id: 2,
            title: "Vocabulary",
            progressThreshold: 66,
            content: detailData.vocab || "No data available",
          },
          {
            id: 3,
            title: "Phonetics",
            progressThreshold: 100,
            content: detailData.phonetic || "No data available",
          },
        ];

        // Transform vocabulary from API response to simplified format for display
        // No need to filter - API already returns data for this lesson only
        const allVocab = vocabRes?.data || [];
        const simplifiedVocabulary = (
          Array.isArray(allVocab) ? allVocab : []
        ).map((item: any) => ({
          word: item.word,
          meaning: item.englishMeaning,
          example: item.exampleSentence || "No example sentence",
        }));

        // Calculate section completion based on current progress
        const sectionsWithCompletion = sections.map((section) => ({
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
        setProgress(foundLesson.progress || 0);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);

  // Update progress locally
  const handleContinueLesson = () => {
  };
  const handleNextLesson = () => {
    if (currentIndex === -1) return;

    const nextLesson = allLessons[currentIndex + 1];
    if (!nextLesson) return;

    navigate(`/lesson/${nextLesson._id}`);
  };
  const handlePause = async () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      const duration = Math.floor(videoRef.current.duration);
      const progressPercent = Math.floor((currentTime / duration) * 100);
      console.log("Đang dừng ở giây thứ:", currentTime);
      try {
        const res = await callSaveProgress(currentLesson._id,progressPercent);
        console.log(">>>> check res: ", res)
      } catch (error) {
        console.error("Lỗi khi lưu tiến độ học:", error);
      }
    }
  };

  const handleLoadedMetadata = () => {
    console.log(">>> check currentLesson", currentLesson.progress);
    if (videoRef.current && currentLesson?.progress) {
      const progress = currentLesson.progress;
      const duration = videoRef.current.duration;
      let seconds = progress * duration / 100;
      videoRef.current.currentTime = seconds;
    }
  };

  // Show loading state
  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <div className="text-center text-muted-foreground">
            Loading lesson...
          </div>
        </div>
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
          Go Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">
                      {currentLesson.lessontitle}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {currentLesson.description}
                    </p>
                  </div>
                  <Badge className={levelColors[currentLesson.level]}>
                    {currentLesson.level}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">15 minutes</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
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
                  <video
                    src={`${
                      import.meta.env.VITE_BACKEND_URL
                    }/api/v1/storage/video/${currentLesson?.videourl}`}
                    controls
                    className="w-full h-full object-cover"
                    onPause={handlePause}
                    onLoadedMetadata={handleLoadedMetadata}
                    ref={videoRef}
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
                <CardTitle>Vocabularies in Lesson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.simplifiedVocabulary?.length > 0 ? (
                  currentLesson.simplifiedVocabulary.map((item, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{item.word}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.meaning}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm italic mt-2">
                        Example:{" "}
                        <span className="font-medium">{item.example}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No vocabulary found for this lesson.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
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
                      <p className="text-xs text-muted-foreground">
                        {section.duration}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(section as any).content}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">
                  {progress === 100 ? "Completed!" : "Complete the Lesson"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {progress === 100
                    ? "You have completed this lesson!"
                    : "Take a quiz to test your knowledge"}
                </p>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => navigate("/games")}
                >
                  Take the Quiz
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={handleNextLesson}
                  disabled={currentIndex === allLessons.length - 1}
                >
                  Next Lesson
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
