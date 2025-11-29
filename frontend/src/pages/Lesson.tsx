// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import Header from "@/components/Header";
// import { BookOpen, Clock, Star, CheckCircle2, Lock, Play } from "lucide-react";

// const Lesson = () => {
//   const lessonTopics = [
//     { id: 1, title: "Greetings & Introductions", completed: true, progress: 100, exercises: 12, time: "15 min" },
//     { id: 2, title: "Numbers & Counting", completed: true, progress: 100, exercises: 10, time: "12 min" },
//     { id: 3, title: "Family Members", completed: false, progress: 60, exercises: 15, time: "18 min" },
//     { id: 4, title: "Food & Drinks", completed: false, progress: 0, exercises: 20, time: "25 min" },
//     { id: 5, title: "Colors & Objects", completed: false, progress: 0, exercises: 14, time: "16 min", locked: true },
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       <div className="container px-4 py-8">
//         {/* Lesson Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-3 bg-primary/10 rounded-2xl">
//               <BookOpen className="h-8 w-8 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-4xl font-bold">Beginner Lessons</h1>
//               <p className="text-muted-foreground mt-1">Master the basics of Vietnamese</p>
//             </div>
//           </div>
          
//           <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
//             <CardContent className="p-6">
//               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//                 <div className="flex-1">
//                   <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
//                   <Progress value={45} className="h-3 mb-2" />
//                   <p className="text-sm font-medium">3 of 12 lessons completed</p>
//                 </div>
//                 <div className="flex gap-6">
//                   <div className="text-center">
//                     <p className="text-3xl font-bold text-primary">67</p>
//                     <p className="text-xs text-muted-foreground">Exercises Done</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl font-bold text-secondary">12</p>
//                     <p className="text-xs text-muted-foreground">Hours Spent</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Lesson Topics */}
//         <div className="space-y-4">
//           {lessonTopics.map((topic) => (
//             <Card key={topic.id} className={topic.locked ? "opacity-60" : ""}>
//               <CardContent className="p-6">
//                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//                   <div className="flex items-start gap-4 flex-1">
//                     <div className={`p-3 rounded-2xl ${
//                       topic.completed ? "bg-primary/20" : 
//                       topic.locked ? "bg-muted" : "bg-secondary/20"
//                     }`}>
//                       {topic.completed ? (
//                         <CheckCircle2 className="h-6 w-6 text-primary" />
//                       ) : topic.locked ? (
//                         <Lock className="h-6 w-6 text-muted-foreground" />
//                       ) : (
//                         <BookOpen className="h-6 w-6 text-secondary" />
//                       )}
//                     </div>
                    
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h3 className="text-xl font-semibold">{topic.title}</h3>
//                         {topic.completed && (
//                           <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>
//                         )}
//                       </div>
                      
//                       <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
//                         <div className="flex items-center gap-1">
//                           <Star className="h-4 w-4" />
//                           {topic.exercises} exercises
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Clock className="h-4 w-4" />
//                           {topic.time}
//                         </div>
//                       </div>
                      
//                       {!topic.locked && topic.progress > 0 && (
//                         <div>
//                           <div className="flex justify-between text-sm mb-1">
//                             <span className="text-muted-foreground">Progress</span>
//                             <span className="font-medium">{topic.progress}%</span>
//                           </div>
//                           <Progress value={topic.progress} className="h-2" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <Button 
//                     variant={topic.completed ? "outline" : "gradient"}
//                     size="lg"
//                     disabled={topic.locked}
//                     className="gap-2 w-full md:w-auto"
//                   >
//                     {topic.locked ? (
//                       <>
//                         <Lock className="h-4 w-4" />
//                         Locked
//                       </>
//                     ) : topic.completed ? (
//                       "Review"
//                     ) : topic.progress > 0 ? (
//                       <>
//                         <Play className="h-4 w-4" />
//                         Continue
//                       </>
//                     ) : (
//                       "Start Lesson"
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Tips Card */}
//         <Card className="mt-8 bg-gradient-to-r from-accent/10 to-primary/10 border-0">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Star className="h-5 w-5 text-accent" />
//               Study Tips
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Practice daily for at least 15 minutes to maintain your streak
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Review completed lessons regularly to reinforce your memory
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Try speaking out loud while learning to improve pronunciation
//               </li>
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Lesson;


// Lesson.tsx




// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { BookOpen, Clock, Star, CheckCircle2, Lock, Play } from "lucide-react";
// import Header from "@/components/Header";
// import { useLessons } from "@/hooks/useLessons";

// const Lesson = () => {
//   const { lessons, loading, overallProgress, stats } = useLessons();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">Loading lessons...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       <div className="container px-4 py-8">
//         {/* Lesson Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-3 bg-primary/10 rounded-2xl">
//               <BookOpen className="h-8 w-8 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-4xl font-bold">Beginner Lessons</h1>
//               <p className="text-muted-foreground mt-1">Master the basics of Vietnamese</p>
//             </div>
//           </div>
          
//           <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
//             <CardContent className="p-6">
//               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//                 <div className="flex-1">
//                   <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
//                   <Progress value={overallProgress} className="h-3 mb-2" />
//                   <p className="text-sm font-medium">
//                     {stats.completedLessons} of {stats.totalLessons} lessons completed
//                   </p>
//                 </div>
//                 <div className="flex gap-6">
//                   <div className="text-center">
//                     <p className="text-3xl font-bold text-primary">{stats.completedExercises}</p>
//                     <p className="text-xs text-muted-foreground">Exercises Done</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl font-bold text-secondary">{stats.hoursSpent}</p>
//                     <p className="text-xs text-muted-foreground">Hours Spent</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Lesson Topics */}
//         <div className="space-y-4">
//           {lessons.map((topic) => (
//             <Card key={topic._id} className={topic.locked ? "opacity-60" : ""}>
//               <CardContent className="p-6">
//                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//                   <div className="flex items-start gap-4 flex-1">
//                     <div className={`p-3 rounded-2xl flex-shrink-0 ${
//                       topic.completed ? "bg-primary/20" : 
//                       topic.locked ? "bg-muted" : "bg-secondary/20"
//                     }`}>
//                       {topic.completed ? (
//                         <CheckCircle2 className="h-6 w-6 text-primary" />
//                       ) : topic.locked ? (
//                         <Lock className="h-6 w-6 text-muted-foreground" />
//                       ) : (
//                         <BookOpen className="h-6 w-6 text-secondary" />
//                       )}
//                     </div>
                    
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h3 className="text-xl font-semibold">{topic.lessontitle}</h3>
//                         {topic.completed && (
//                           <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>
//                         )}
//                       </div>
                      
//                       <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
//                         {topic.description}
//                       </p>
                      
//                       <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
//                         <div className="flex items-center gap-1">
//                           <Star className="h-4 w-4" />
//                           {topic.exercises} exercises
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Clock className="h-4 w-4" />
//                           {topic.time}
//                         </div>
//                       </div>
                      
//                       {!topic.locked && topic.progress > 0 && (
//                         <div>
//                           <div className="flex justify-between text-sm mb-1">
//                             <span className="text-muted-foreground">Progress</span>
//                             <span className="font-medium">{topic.progress}%</span>
//                           </div>
//                           <Progress value={topic.progress} className="h-2" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <Button 
//                     variant={topic.completed ? "outline" : topic.locked ? "secondary" : "gradient"}
//                     size="lg"
//                     disabled={topic.locked}
//                     className="gap-2 w-full md:w-auto min-w-[120px]"
//                   >
//                     {topic.locked ? (
//                       <>
//                         <Lock className="h-4 w-4" />
//                         Locked
//                       </>
//                     ) : topic.completed ? (
//                       <>
//                         <CheckCircle2 className="h-4 w-4" />
//                         Review
//                       </>
//                     ) : topic.progress > 0 ? (
//                       <>
//                         <Play className="h-4 w-4" />
//                         Continue
//                       </>
//                     ) : (
//                       <>
//                         <Play className="h-4 w-4" />
//                         Start Lesson
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Tips Card */}
//         <Card className="mt-8 bg-gradient-to-r from-accent/10 to-primary/10 border-0">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Star className="h-5 w-5 text-accent" />
//               Study Tips
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Practice daily for at least 15 minutes to maintain your streak
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Review completed lessons regularly to reinforce your memory
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-accent">•</span>
//                 Try speaking out loud while learning to improve pronunciation
//               </li>
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Lesson;



import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, CheckCircle2, Lock, Play } from "lucide-react";
import Header from "@/components/Header";
import { useLessons } from "@/hooks/useLessons";
import { Link } from "react-router-dom";

const Lesson = () => {
  const {
    lessons,
    page,
    totalPages,
    totalElements,
    loading,
    error,
    overallProgress,
    stats,
    nextPage,
    prevPage,
    goToPage,
    goFirst,
    goLast,
  } = useLessons(5);

  const goPrev = () => prevPage();
  const goNext = () => nextPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Beginner Lessons</h1>
              <p className="text-muted-foreground mt-1">Master the basics of Vietnamese</p>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                  <Progress value={overallProgress} className="h-3 mb-2" />
                  <p className="text-sm font-medium">
                    {stats.completedLessons} of {totalElements} lessons completed
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{stats.completedExercises}</p>
                    <p className="text-xs text-muted-foreground">Exercises Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{stats.hoursSpent}</p>
                    <p className="text-xs text-muted-foreground">Hours Spent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons List - One per row */}
        <div className="space-y-4 mb-8">
          {lessons.map((topic) => (
            <Link 
              key={topic._id} 
              to={`/lesson/${topic._id}`}
              className="block"
            >
              <Card className={`
                ${topic.locked ? "opacity-60 cursor-not-allowed" : "group hover:shadow-lg transition-all duration-300"}
                ${topic.completed ? "border-primary/20" : topic.locked ? "border-muted" : ""}
              `}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-2xl flex-shrink-0 ${
                        topic.completed ? "bg-primary/20" : 
                        topic.locked ? "bg-muted" : "bg-secondary/20"
                      }`}>
                        {topic.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : topic.locked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-secondary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {topic.lessontitle}
                          </h3>
                          {topic.completed && (
                            <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {topic.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {topic.exercises} exercises
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {topic.time}
                          </div>
                        </div>
                        
                        {!topic.locked && topic.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{topic.progress}%</span>
                            </div>
                            <Progress value={topic.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant={topic.completed ? "outline" : topic.locked ? "secondary" : "default"}
                      size="lg"
                      disabled={topic.locked}
                      className="gap-2 w-full md:w-[150px] group-hover:scale-105 transition-all duration-300"
                    >
                      {topic.locked ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Locked
                        </>
                      ) : topic.completed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Review
                        </>
                      ) : topic.progress > 0 ? (
                        <>
                          <Play className="h-4 w-4" />
                          Continue
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Lesson
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={goFirst}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              {"<<"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={goPrev}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              {"<"}
            </Button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum: number;
              
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (page === 1) {
                pageNum = i + 1;
              } else if (page === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = page - 1 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === page ? "default" : "outline"}
                  onClick={() => goToPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Next page */}
            <Button
              size="sm"
              variant="outline"
              onClick={goNext}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              {">"}
            </Button>

            {/* Last page */}
            <Button
              size="sm"
              variant="outline"
              onClick={goLast}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              {">>"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson;