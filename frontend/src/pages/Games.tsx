import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Gamepad2, Trophy, Zap, Target, Brain, MessageSquare, Image as ImageIcon, Headphones } from "lucide-react";
import { callGetGames, callGetUserStats } from "@/config/api";
import { IBackendRes, IPaginationRes } from "@/types/common.type";

const Games = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<{ totalPoints: number; gamesPlayed: number; highestScore: number } | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = (await callGetGames(1, 20)) as unknown as IBackendRes<IPaginationRes<any>>;
        const result = res?.data?.result ?? [];
        setGames(result);
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();

    // Load user stats (giả sử userId từ localStorage)
    const fetchUserStats = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const userId = payload.user.id;
        const res = await callGetUserStats(userId);
        setUserStats(res.data);
      }
    };
    fetchUserStats();
  }, []);

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
        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading games...</div>
          ) : (
            games.map((game: any) => {
              const Icon = Zap; // fallback icon
              const gameId = game._id || game.id || "-";
              const title = game.name || game.title || "Untitled Game";
              const description = game.description || "";
              const difficulty = game.difficulty || "Medium";
              return (
                <Link key={gameId} to={`/game/${gameId}`}>
                  <Card className="group hover:scale-[1.02] transition-transform cursor-pointer">
                    <CardHeader>
                      <div className={`w-fit p-3 rounded-2xl bg-primary/10 mb-3`}>
                        <Icon className={`h-8 w-8 text-primary`} />
                      </div>
                      <CardTitle className="text-xl">{title}</CardTitle>
                      <CardDescription className="line-clamp-2">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getDifficultyColor(difficulty)} border-0`}>
                          {difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Trophy className="h-4 w-4" />
                          {game.points ? `+${game.points} points` : `-`}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Times Played</span>
                          <span className="font-medium">{game.timesPlayed ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best Score</span>
                          <span className="font-medium">{game.bestScore ?? 0}</span>
                        </div>
                      </div>
                      <Button variant="gradient" className="w-full group-hover:shadow-lg transition-shadow">
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
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