// LessonDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle2, Clock, BookOpen, Languages, Volume2 } from "lucide-react";
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

const sectionStyles: Record<string, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  icon: any;
}> = {
  Grammar: {
    bg: "bg-indigo-50/50 dark:bg-indigo-950/15",
    border: "border border-indigo-100/50 dark:border-indigo-950/30 border-l-4 border-l-indigo-500",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: BookOpen,
  },
  Vocabulary: {
    bg: "bg-amber-50/50 dark:bg-amber-950/15",
    border: "border border-amber-100/50 dark:border-amber-950/30 border-l-4 border-l-amber-500",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: Languages,
  },
  Phonetics: {
    bg: "bg-emerald-50/50 dark:bg-emerald-950/15",
    border: "border border-emerald-100/50 dark:border-emerald-950/30 border-l-4 border-l-emerald-500",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: Volume2,
  },
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
                      <span className="text-sm font-bold text-muted-foreground">Lesson Progress</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progress}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2 bg-red-100 dark:bg-red-950/40 border border-red-200/20 dark:border-red-900/10 overflow-hidden" 
                      indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Video Player & Action Button Section */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-md border border-black/10">
                <video
                  src={`${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/v1/storage/video/${currentLesson?.videourl}`}
                  controls
                  className="w-full h-full object-cover rounded-2xl"
                  onPause={handlePause}
                  onLoadedMetadata={handleLoadedMetadata}
                  ref={videoRef}
                />
              </div>
              <Button
                variant="default"
                size="lg"
                className="w-full py-6 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm hover:scale-100 active:scale-[0.98]"
                onClick={handleContinueLesson}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                {progress === 100 ? "Review Lesson" : "Continue Learning"}
              </Button>
            </div>

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
            <Card className="border border-primary/10 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold tracking-tight">Lesson Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.sections?.map((section) => {
                  const style = sectionStyles[section.title] || {
                    bg: "bg-muted/50",
                    border: "border border-muted/50 border-l-4 border-l-primary",
                    iconBg: "bg-primary/10",
                    iconColor: "text-primary",
                    icon: BookOpen
                  };
                  const IconComponent = style.icon;

                  return (
                    <div
                      key={section.id}
                      className={`group flex flex-col p-4 rounded-2xl transition-all duration-300 hover:shadow-md ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${style.iconBg} ${style.iconColor}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground tracking-tight">{section.title}</p>
                            {section.duration && (
                              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{section.duration}</p>
                            )}
                          </div>
                        </div>

                        {section.completed ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Done
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <div className="bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground leading-relaxed break-words font-medium">
                          {(section as any).content}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
