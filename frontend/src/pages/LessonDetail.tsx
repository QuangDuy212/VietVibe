// import { useParams, useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Play, CheckCircle2, Clock } from "lucide-react";

// const LessonDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Mock data - thay bằng data thật từ API
//   const lesson = {
//     id: id,
//     title: "Chào hỏi và Giới thiệu",
//     description: "Học cách chào hỏi và giới thiệu bản thân bằng tiếng Việt",
//     level: "Beginner",
//     duration: "15 phút",
//     progress: 60,
//     videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Thay bằng video thật
//     sections: [
//       {
//         id: 1,
//         title: "Giới thiệu",
//         duration: "3 phút",
//         completed: true,
//       },
//       {
//         id: 2,
//         title: "Từ vựng cơ bản",
//         duration: "5 phút",
//         completed: true,
//       },
//       {
//         id: 3,
//         title: "Thực hành hội thoại",
//         duration: "7 phút",
//         completed: false,
//       },
//     ],
//     vocabulary: [
//       { word: "Xin chào", meaning: "Hello", example: "Xin chào! Tôi là Mai." },
//       { word: "Tạm biệt", meaning: "Goodbye", example: "Tạm biệt! Hẹn gặp lại." },
//       { word: "Cảm ơn", meaning: "Thank you", example: "Cảm ơn bạn rất nhiều!" },
//     ],
//   };

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case "Beginner":
//         return "bg-primary/20 text-primary";
//       case "Intermediate":
//         return "bg-secondary/20 text-secondary";
//       case "Advanced":
//         return "bg-accent/20 text-accent";
//       default:
//         return "bg-muted text-muted-foreground";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       <div className="container px-4 py-8">
//         {/* Back Button */}
//         <Button 
//           variant="ghost" 
//           className="mb-6"
//           onClick={() => navigate("/lesson")}
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Quay lại
//         </Button>

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Lesson Header */}
//             <Card>
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="space-y-2">
//                     <CardTitle className="text-3xl">{lesson.title}</CardTitle>
//                     <p className="text-muted-foreground">{lesson.description}</p>
//                   </div>
//                   <Badge className={`${getLevelColor(lesson.level)} border-0`}>
//                     {lesson.level}
//                   </Badge>
//                 </div>
                
//                 <div className="flex items-center gap-4 mt-4">
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <Clock className="h-4 w-4" />
//                     <span className="text-sm">{lesson.duration}</span>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-medium">Tiến độ</span>
//                       <span className="text-sm text-muted-foreground">{lesson.progress}%</span>
//                     </div>
//                     <Progress value={lesson.progress} className="h-2" />
//                   </div>
//                 </div>
//               </CardHeader>
//             </Card>

//             {/* Video Player */}
//             <Card>
//               <CardContent className="p-0">
//                 <div className="aspect-video bg-muted rounded-t-2xl overflow-hidden">
//                   <iframe
//                     width="100%"
//                     height="100%"
//                     src={lesson.videoUrl}
//                     title={lesson.title}
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     className="w-full h-full"
//                   />
//                 </div>
//                 <div className="p-6">
//                   <Button variant="gradient" size="lg" className="w-full">
//                     <Play className="h-5 w-5 mr-2" />
//                     Tiếp tục học
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Vocabulary Section */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Từ vựng trong bài</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {lesson.vocabulary.map((item, index) => (
//                   <div key={index} className="p-4 bg-muted/50 rounded-xl">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <h4 className="font-semibold text-lg">{item.word}</h4>
//                         <p className="text-sm text-muted-foreground">{item.meaning}</p>
//                       </div>
//                     </div>
//                     <p className="text-sm italic mt-2">
//                       Ví dụ: <span className="font-medium">{item.example}</span>
//                     </p>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Lesson Sections */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Nội dung bài học</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {lesson.sections.map((section) => (
//                   <div
//                     key={section.id}
//                     className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
//                   >
//                     {section.completed ? (
//                       <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
//                     ) : (
//                       <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
//                     )}
//                     <div className="flex-1">
//                       <p className="font-medium text-sm">{section.title}</p>
//                       <p className="text-xs text-muted-foreground">{section.duration}</p>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
//               <CardContent className="p-6 text-center">
//                 <h3 className="font-semibold mb-2">Hoàn thành bài học</h3>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   Làm quiz để kiểm tra kiến thức
//                 </p>
//                 <Button variant="default" className="w-full">
//                   Làm bài kiểm tra
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LessonDetail;


// LessonDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useLessons } from "@/hooks/useLessons";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lessons, updateLessonProgress, loading } = useLessons();
  const [currentLesson, setCurrentLesson] = useState<any>(null);

  useEffect(() => {
    if (id && lessons.length > 0) {
      const lesson = lessons.find(l => l._id === id);
      if (lesson) {
        setCurrentLesson({
          ...lesson,
          sections: [
            { id: 1, title: "Giới thiệu", duration: "3 phút", completed: lesson.progress >= 33 },
            { id: 2, title: "Từ vựng cơ bản", duration: "5 phút", completed: lesson.progress >= 66 },
            { id: 3, title: "Thực hành hội thoại", duration: "7 phút", completed: lesson.progress === 100 },
          ],
          vocabulary: [
            { word: "Xin chào", meaning: "Hello", example: "Xin chào! Tôi là Mai." },
            { word: "Tạm biệt", meaning: "Goodbye", example: "Tạm biệt! Hẹn gặp lại." },
            { word: "Cảm ơn", meaning: "Thank you", example: "Cảm ơn bạn rất nhiều!" },
          ],
        });
      }
    }
  }, [id, lessons]);

  const handleContinueLesson = () => {
    // Simulate progress update
    if (currentLesson) {
      const newProgress = Math.min(100, currentLesson.progress + 20);
      updateLessonProgress(currentLesson._id, newProgress);
    }
  };

  const handleCompleteLesson = () => {
    if (currentLesson) {
      updateLessonProgress(currentLesson._id, 100);
    }
  };

  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading lesson...</div>
      </div>
    );
  }

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
                      <span className="text-sm">{currentLesson.progress}%</span>
                    </div>
                    <Progress value={currentLesson.progress} className="h-2" />
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
                    variant="gradient" 
                    size="lg" 
                    className="w-full"
                    onClick={handleContinueLesson}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {currentLesson.progress === 100 ? "Review Lesson" : "Continue Learning"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Từ vựng trong bài</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.vocabulary?.map((item: any, index: number) => (
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
                ))}
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
                {currentLesson.sections?.map((section: any) => (
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
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">
                  {currentLesson.progress === 100 ? "Hoàn thành!" : "Hoàn thành bài học"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentLesson.progress === 100 
                    ? "Bạn đã hoàn thành bài học này!" 
                    : "Làm quiz để kiểm tra kiến thức"
                  }
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={currentLesson.progress === 100 ? undefined : handleCompleteLesson}
                  disabled={currentLesson.progress === 100}
                >
                  {currentLesson.progress === 100 ? "Đã hoàn thành" : "Làm bài kiểm tra"}
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