import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  } = useLessons(6); // 6 lessons per page để hiển thị (lưới 3 cột x 2 hàng)

  // Lọc lessons theo search và level
  const filteredLessons = lessons.filter((lesson) => {
    // 1. Filter theo search query (Tiêu đề hoặc Mô tả)
    const matchesSearch =
      lesson.lessontitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Filter theo Level (Dùng trực tiếp trường 'level' từ JSON)
    // Chuyển level về chữ thường để so sánh (ví dụ: "BEGINNER" -> "beginner")
    const lessonLevel = lesson.level ? lesson.level.toLowerCase() : "beginner";

    // Chuẩn hóa levelFilter của bạn (nếu levelFilter là "advanced" thì khớp với "advance")
    const normalizedFilter = levelFilter.toLowerCase();

    // Xử lý trường hợp đặc biệt nếu Backend trả về "ADVANCE" nhưng UI dùng "advanced"
    const isLevelMatch =
      normalizedFilter === "all" ||
      lessonLevel === normalizedFilter ||
      (lessonLevel === "advance" && normalizedFilter === "advanced");

    return matchesSearch && isLevelMatch;
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
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCE">Advanced</SelectItem>
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
                return (
                  <LessonCard
                    key={lesson._id}
                    id={lesson._id}
                    title={lesson.lessontitle}
                    description={lesson.description}
                    level={lesson.level}
                    duration={lesson.time}
                    progress={lesson.progress}
                    locked={lesson.locked}
                    completed={lesson.completed}
                  />
                );

              })}
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-10">
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