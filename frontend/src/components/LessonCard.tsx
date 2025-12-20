import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Lock, CheckCircle2, Play } from "lucide-react";

interface LessonCardProps {
  id?: string | number;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  progress?: number;
  locked?: boolean;
  completed?: boolean;
}

const levelColors = {
  BEGINNER: "bg-secondary/10 text-secondary",
  INTERMEDIATE: "bg-accent/10 text-accent",
  ADVANCE: "bg-primary/10 text-primary",
};

const LessonCard = ({
  id = "1",
  title,
  description,
  level,
  duration,
  progress = 0,
  locked = false,
  completed = false,
}: LessonCardProps) => {
  return (
    <Link to={locked ? "#" : `/lesson/${id}`} className={locked ? "pointer-events-none" : ""}>
      <Card className="group h-full flex flex-col hover:scale-[1.02] transition">
        
        {/* HEADER */}
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <CardTitle className={`text-xl ${locked ? "text-muted-foreground" : "group-hover:text-primary"}`}>
              {title}
            </CardTitle>

            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : locked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Star className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {description}
          </p>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={levelColors[level]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}>{level}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {duration}
            </div>
          </div>

          {/* Progress */}
          {!locked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* BUTTON – LUÔN NẰM ĐÁY */}
          <div className="mt-auto">
            {locked ? (
              <Button className="w-full bg-teal-100 text-teal-700" disabled>
                <Lock className="h-4 w-4 mr-2" /> Locked
              </Button>
            ) : completed ? (
              <Button variant="outline" className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Review
              </Button>
            ) : progress > 0 ? (
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" /> Continue
              </Button>
            ) : (
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" /> Start Lesson
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LessonCard;
