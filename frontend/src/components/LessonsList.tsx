import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import LessonCard from "./LessonCard";
import { useLessons } from "@/hooks/useLessons";
import { Button } from "@/components/ui/button";

const LessonsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // Sử dụng hook để fetch data từ API
  const { 
    lessons, 
    loading, 
    error,
    page,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goFirst,
    goLast
  } = useLessons(8); // 8 lessons per page để hiển thị grid 4 cột x 2 hàng

  // Lọc lessons theo search và level
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = 
      lesson.lessontitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Map level từ progress/locked status
    let lessonLevel = "beginner";
    if (lesson.locked) {
      lessonLevel = lesson.exercises > 18 ? "advanced" : "intermediate";
    } else if (lesson.completed) {
      lessonLevel = "beginner";
    } else {
      lessonLevel = "intermediate";
    }
    
    const matchesLevel = levelFilter === "all" || lessonLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <section id="lessons" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Lesson
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start learning with our carefully crafted lessons designed for all levels
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading lessons...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Lessons Grid */}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLessons.map((lesson) => {
                // Map lesson data từ API sang format của LessonCard
                let level: "beginner" | "intermediate" | "advanced" = "beginner";
                if (lesson.locked) {
                  level = lesson.exercises > 18 ? "advanced" : "intermediate";
                } else if (!lesson.completed) {
                  level = "intermediate";
                }

                return (
                  <LessonCard
                    key={lesson._id}
                    id={lesson._id}
                    title={lesson.lessontitle}
                    description={lesson.description}
                    level={level}
                    duration={lesson.time}
                    progress={lesson.progress}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goFirst}
                  disabled={!hasPrev}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={!hasPrev}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasNext}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goLast}
                  disabled={!hasNext}
                >
                  Last
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredLessons.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No lessons found. Try a different search term or filter.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LessonsList;