import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Gamepad2, Trophy, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { callGetGames, callGetUserStats } from "@/config/api";
import { IBackendRes, IPaginationRes } from "@/types/common.type";

const Games = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<{ totalPoints: number; gamesPlayed: number; highestScore: number } | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(6); // 6 games per page (lưới 3 cột x 2 hàng)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = (await callGetGames(page, pageSize)) as unknown as IBackendRes<IPaginationRes<any>>;
        const result = res?.data?.result ?? [];
        setGames(result);
        if (res?.data?.meta) {
          setTotalPages(res.data.meta.pages);
        }
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [page, pageSize]);

  useEffect(() => {
    const fetchUserStats = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const userId = payload.user.id;
          const res = await callGetUserStats(userId);
          setUserStats(res.data);
        } catch {}
      }
    };
    fetchUserStats();
  }, []);

  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const goToPage = (pageNum: number) => setPage(pageNum);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":   return "bg-emerald-100 text-emerald-700 border-0";
      case "Medium": return "bg-amber-100 text-amber-700 border-0";
      case "Hard":   return "bg-rose-100 text-rose-700 border-0";
      default:       return "bg-muted text-muted-foreground border-0";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Gamepad2 className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learning Games</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Make learning fun and interactive</p>
            </div>
          </div>

          {/* Stats mini bar */}
          {userStats && (
            <div className="hidden md:flex items-center gap-6 bg-muted/40 px-5 py-3 rounded-2xl border border-border/50">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{userStats.totalPoints ?? 0}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Points</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-accent">{userStats.gamesPlayed ?? 0}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Played</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">{userStats.highestScore ?? 0}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Best</p>
              </div>
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Loading games...
            </div>
          ) : (
            games.map((game: any) => {
              const gameId = game._id || game.id || "-";
              const title = game.name || game.title || "Untitled Game";
              const description = game.description || "";
              const difficulty = game.difficulty || "Medium";

              return (
                <Link key={gameId} to={`/game/${gameId}`} className="flex flex-col h-full">
                  <Card className="group border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-1 flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="w-fit p-3 rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/15 transition-colors">
                        <Zap className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 h-[52px]">{title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm h-10">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyBadge(difficulty)}>
                          {difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Trophy className="h-3.5 w-3.5" />
                          {game.points ? `+${game.points} pts` : "–"}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm border-t pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Times Played</p>
                          <p className="font-semibold">{game.timesPlayed ?? 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Best Score</p>
                          <p className="font-semibold text-primary">{game.bestScore ?? 0}</p>
                        </div>
                      </div>

                      <Button
                        variant="gradient"
                        className="w-full group-hover:shadow-md transition-shadow"
                      >
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages >= 1 && (
          <div className="flex justify-center items-center gap-2.5 mt-8 mb-10">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={!hasPrev}
              className="w-10 h-10 rounded-2xl border border-border/60 hover:bg-muted transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground/80" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              return (
                <Button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 rounded-2xl font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-md hover:bg-primary/95 scale-105"
                      : "border border-border/60 bg-transparent text-foreground hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={!hasNext}
              className="w-10 h-10 rounded-2xl border border-border/60 hover:bg-muted transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground/80" />
            </Button>
          </div>
        )}

        {/* Daily Challenge */}
        <Card className="bg-gradient-to-r from-primary via-secondary to-accent border-0 overflow-hidden">
          <CardContent className="p-8 text-center text-primary-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Daily Challenge</h2>
            <p className="mb-6 opacity-80 max-w-md mx-auto text-sm">
              Complete today's challenge to earn double points and maintain your streak!
            </p>
            <Button variant="secondary" size="lg" className="font-semibold px-8">
              Start Daily Challenge
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Games;