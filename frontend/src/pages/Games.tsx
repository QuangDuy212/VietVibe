import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Gamepad2, Trophy, Zap, Target, Brain, MessageSquare, Image as ImageIcon, Headphones } from "lucide-react";

const Games = () => {
  const games = [
    {
      id: 1,
      title: "Flashcard Challenge",
      description: "Match Vietnamese words with their English translations",
      icon: Zap,
      difficulty: "Easy",
      points: 50,
      color: "primary",
      played: 12,
      bestScore: 850
    },
    {
      id: 2,
      title: "Pronunciation Master",
      description: "Listen and repeat Vietnamese words to improve your accent",
      icon: Headphones,
      difficulty: "Medium",
      points: 75,
      color: "secondary",
      played: 8,
      bestScore: 920
    },
    {
      id: 3,
      title: "Word Builder",
      description: "Build sentences using Vietnamese words and grammar",
      icon: Brain,
      difficulty: "Hard",
      points: 100,
      color: "accent",
      played: 5,
      bestScore: 650
    },
    {
      id: 4,
      title: "Picture Match",
      description: "Match images with the correct Vietnamese vocabulary",
      icon: ImageIcon,
      difficulty: "Easy",
      points: 50,
      color: "primary",
      played: 15,
      bestScore: 980
    },
    {
      id: 5,
      title: "Speed Quiz",
      description: "Answer as many questions as you can in 60 seconds",
      icon: Target,
      difficulty: "Medium",
      points: 75,
      color: "secondary",
      played: 10,
      bestScore: 1200
    },
    {
      id: 6,
      title: "Conversation Practice",
      description: "Practice real-life conversations in Vietnamese",
      icon: MessageSquare,
      difficulty: "Hard",
      points: 100,
      color: "accent",
      played: 3,
      bestScore: 450
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-primary/20 text-primary";
      case "Medium":
        return "bg-secondary/20 text-secondary";
      case "Hard":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Games Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Gamepad2 className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Learning Games</h1>
              <p className="text-muted-foreground mt-1">Make learning fun and interactive</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,250</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/20 rounded-2xl">
                  <Gamepad2 className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">53</p>
                  <p className="text-sm text-muted-foreground">Games Played</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/20 rounded-2xl">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">980</p>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.id} to={`/game/${game.id}`}>
                <Card className="group hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardHeader>
                    <div className={`w-fit p-3 rounded-2xl bg-${game.color}/10 mb-3`}>
                      <Icon className={`h-8 w-8 text-${game.color}`} />
                    </div>
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDifficultyColor(game.difficulty)} border-0`}>
                        {game.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        +{game.points} points
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Times Played</span>
                        <span className="font-medium">{game.played}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Score</span>
                        <span className="font-medium">{game.bestScore}</span>
                      </div>
                    </div>

                    <Button variant="gradient" className="w-full group-hover:shadow-lg transition-shadow">
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Daily Challenge */}
        <Card className="mt-8 bg-gradient-to-r from-primary via-secondary to-accent border-0">
          <CardContent className="p-8 text-center text-primary-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Daily Challenge</h2>
            <p className="mb-6 opacity-90">
              Complete today's challenge to earn double points and maintain your streak!
            </p>
            <Button variant="secondary" size="lg">
              Start Daily Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Games;
