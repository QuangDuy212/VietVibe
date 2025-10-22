import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { BookOpen, Clock, Star, CheckCircle2, Lock, Play } from "lucide-react";

const Lesson = () => {
  const lessonTopics = [
    { id: 1, title: "Greetings & Introductions", completed: true, progress: 100, exercises: 12, time: "15 min" },
    { id: 2, title: "Numbers & Counting", completed: true, progress: 100, exercises: 10, time: "12 min" },
    { id: 3, title: "Family Members", completed: false, progress: 60, exercises: 15, time: "18 min" },
    { id: 4, title: "Food & Drinks", completed: false, progress: 0, exercises: 20, time: "25 min" },
    { id: 5, title: "Colors & Objects", completed: false, progress: 0, exercises: 14, time: "16 min", locked: true },
  ];

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
                  <Progress value={45} className="h-3 mb-2" />
                  <p className="text-sm font-medium">3 of 12 lessons completed</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">67</p>
                    <p className="text-xs text-muted-foreground">Exercises Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">12</p>
                    <p className="text-xs text-muted-foreground">Hours Spent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Topics */}
        <div className="space-y-4">
          {lessonTopics.map((topic) => (
            <Card key={topic.id} className={topic.locked ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-2xl ${
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
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{topic.title}</h3>
                        {topic.completed && (
                          <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>
                        )}
                      </div>
                      
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
                    variant={topic.completed ? "outline" : "gradient"}
                    size="lg"
                    disabled={topic.locked}
                    className="gap-2 w-full md:w-auto"
                  >
                    {topic.locked ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Locked
                      </>
                    ) : topic.completed ? (
                      "Review"
                    ) : topic.progress > 0 ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continue
                      </>
                    ) : (
                      "Start Lesson"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Card */}
        <Card className="mt-8 bg-gradient-to-r from-accent/10 to-primary/10 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Practice daily for at least 15 minutes to maintain your streak
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Review completed lessons regularly to reinforce your memory
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Try speaking out loud while learning to improve pronunciation
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Lesson;
