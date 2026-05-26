import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, CheckCircle2, Lock, Play } from "lucide-react";
import Header from "@/components/Header";
import { useLessons } from "@/hooks/useLessons";
import { Link } from "react-router-dom";

const levelContent: Record<string, { title: string; desc: string }> = {
  ALL: {
    title: "Vietnamese Lessons",
    desc: "Master Vietnamese from beginner to advanced paths",
  },
  BEGINNER: {
    title: "Beginner Lessons",
    desc: "Master the basics of Vietnamese",
  },
  INTERMEDIATE: {
    title: "Intermediate Lessons",
    desc: "Improve your conversation and grammar skills",
  },
  ADVANCE: {
    title: "Advanced Lessons",
    desc: "Achieve native fluency with complex topics",
  },
};

const levelBadgeColors: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0",
  INTERMEDIATE: "bg-accent/10 text-accent border-0",
  ADVANCE: "bg-primary/10 text-primary border-0",
};

const levelBadgeLabels: Record<string, string> = {
  BEGINNER: "Dễ",
  INTERMEDIATE: "Trung bình",
  ADVANCE: "Khó",
};

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
    level,
    changeLevel,
    nextPage,
    prevPage,
    goToPage,
    goFirst,
    goLast,
  } = useLessons(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

  const currentLevelInfo = levelContent[level] || levelContent.ALL;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium background decorative blur elements */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse duration-4000" />
      <div className="absolute top-80 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse duration-6000" style={{ animationDelay: "2s" }} />

      <Header />

      <div className="container max-w-5xl px-4 py-10 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner group hover:scale-110 transition-all duration-300">
              <BookOpen className="h-9 w-9 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent transition-all duration-500">
                {currentLevelInfo.title}
              </h1>
              <p className="text-muted-foreground mt-1.5 text-base md:text-lg transition-all duration-500">
                {currentLevelInfo.desc}
              </p>
            </div>
          </div>

          {/* Elegant Brand Coral Capsule Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-muted/50 backdrop-blur-sm p-1.5 rounded-2xl border border-primary/10 mb-6 max-w-max">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "BEGINNER", label: "Dễ (Beginner)" },
              { id: "INTERMEDIATE", label: "Trung bình" },
              { id: "ADVANCE", label: "Khó (Advanced)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeLevel(tab.id)}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 ${
                  level === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-card/85 via-card/50 to-muted/30 backdrop-blur-md border border-primary/15 shadow-xl rounded-2xl transition-all duration-300 hover:border-primary/25">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-semibold tracking-wide uppercase text-primary/80">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      {Math.round(overallProgress)}%
                    </span>
                  </div>
                  <Progress 
                    value={overallProgress} 
                    className="h-3.5 mb-3 bg-red-100 dark:bg-red-950/40 border border-red-200/30 dark:border-red-900/20 overflow-hidden" 
                    indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  />
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>
                      <strong className="text-foreground">{stats.completedLessons}</strong> of <strong className="text-foreground">{totalElements}</strong> lessons completed
                    </span>
                  </p>
                </div>

                <div className="flex gap-8 border-t md:border-t-0 md:border-l border-primary/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-around">
                  <div className="text-center group">
                    <p className="text-4xl font-extrabold text-emerald-500 drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                      {stats.completedLessons}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                      Completed
                    </p>
                  </div>
                  <div className="text-center group">
                    <p className="text-4xl font-extrabold text-secondary drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                      {totalElements}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                      Lessons
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons */}
        <div className="space-y-5 mb-10">
          {lessons.length === 0 ? (
            <Card className="border border-dashed border-primary/20 bg-card/50 backdrop-blur-sm rounded-2xl p-10 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold">Chưa có bài học nào</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Các bài học thuộc cấp độ này đang được biên soạn và sẽ sớm ra mắt!
              </p>
            </Card>
          ) : (
            lessons.map((topic) => {
              const card = (
                <Card
                  className={`
                    group overflow-hidden relative
                    ${topic.locked
                      ? "opacity-60 cursor-not-allowed bg-muted/40"
                      : "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-card"
                    }
                    ${topic.completed 
                      ? "border-emerald-500/20 hover:border-emerald-500/30" 
                      : topic.locked 
                        ? "border-muted/30" 
                        : "border-primary/10 hover:border-primary/30"
                    }
                    border shadow-sm
                  `}
                >
                  {/* Complete indicator line on the left side of the card */}
                  {topic.completed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  )}
                  {!topic.completed && !topic.locked && topic.progress > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                  )}

                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex gap-5 flex-1 items-start">
                        {/* ICON PILL */}
                        <div
                          className={`
                            w-14 h-14
                            flex items-center justify-center
                            rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-sm
                            ${topic.completed
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : topic.locked
                                ? "bg-muted border-muted text-muted-foreground"
                                : "bg-primary/10 border-primary/20 text-primary"
                            }
                          `}
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : topic.locked ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            <BookOpen className="h-6 w-6" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors duration-300">
                              {topic.lessontitle}
                            </h3>
                            <Badge className={`${levelBadgeColors[topic.level]} font-semibold`}>
                              {levelBadgeLabels[topic.level]}
                            </Badge>
                            {topic.completed && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-semibold">
                                Done
                              </Badge>
                            )}
                            {!topic.completed && !topic.locked && topic.progress > 0 && (
                              <Badge className="bg-primary/10 text-primary border-0 font-semibold animate-pulse">
                                In Progress
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {topic.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground/80 mb-4">
                            <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg">
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              <span>{topic.exercises} exercises</span>
                            </div>
                            {topic.time && topic.time.trim() !== "" && (
                              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg">
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>{topic.time}</span>
                              </div>
                            )}
                          </div>

                          {!topic.locked && topic.progress > 0 && (
                            <div className="max-w-xs mt-3">
                              <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-muted-foreground">
                                  Lesson Progress
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {topic.progress}%
                                </span>
                              </div>
                              <Progress 
                                value={topic.progress} 
                                className="h-2 bg-red-100 dark:bg-red-950/40 border border-red-200/20 dark:border-red-900/10 overflow-hidden" 
                                indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="lg"
                        disabled={topic.locked}
                        variant={
                          topic.completed
                            ? "outline"
                            : topic.locked
                              ? "secondary"
                              : "default"
                        }
                        className={`
                          gap-2 w-full md:w-[160px] font-bold rounded-xl shadow-sm transition-all duration-300 active:scale-95
                          ${topic.locked 
                            ? "bg-muted/50 text-muted-foreground border border-muted" 
                            : topic.completed 
                              ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 group-hover:border-emerald-500/40" 
                              : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-md hover:scale-105"
                          }
                        `}
                      >
                        {topic.locked ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Locked
                          </>
                        ) : topic.completed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Review
                          </>
                        ) : topic.progress > 0 ? (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            Start Lesson
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );

              return topic.locked ? (
                <div key={topic._id}>{card}</div>
              ) : (
                <Link key={topic._id} to={`/lesson/${topic._id}`} className="block">
                  {card}
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goFirst} 
              disabled={page === 1}
              className="rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {"<<"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={prevPage} 
              disabled={page === 1}
              className="rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {"<"}
            </Button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let p =
                totalPages <= 3
                  ? i + 1
                  : page === 1
                    ? i + 1
                    : page === totalPages
                      ? totalPages - 2 + i
                      : page - 1 + i;

              return (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "default" : "outline"}
                  onClick={() => goToPage(p)}
                  className={`rounded-lg px-3.5 transition-all duration-300 font-bold ${
                    p === page 
                      ? "bg-primary text-primary-foreground shadow-sm scale-105" 
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {p}
                </Button>
              );
            })}

            <Button 
              size="sm" 
              variant="outline" 
              onClick={nextPage} 
              disabled={page >= totalPages}
              className="rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {">"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goLast} 
              disabled={page >= totalPages}
              className="rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
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
