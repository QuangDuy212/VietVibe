import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

interface LessonCardProps {
  id?: string | number;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  progress?: number;
}

const levelColors = {
  beginner: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  intermediate: "bg-accent/10 text-accent hover:bg-accent/20",
  advanced: "bg-primary/10 text-primary hover:bg-primary/20",
};

const LessonCard = ({ id = "1", title, description, level, duration, progress }: LessonCardProps) => {
  return (
    <Link to={`/lesson/${id}`}>
      <Card className="group hover:scale-[1.02] cursor-pointer">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <Star className="h-5 w-5 text-muted-foreground hover:text-yellow-500 transition-colors cursor-pointer" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={levelColors[level]} variant="secondary">
            {level}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Button className="w-full" variant={progress ? "outline" : "default"}>
          {progress ? "Continue" : "Start Lesson"}
        </Button>
      </CardContent>
    </Card>
    </Link>
  );
};

export default LessonCard;
