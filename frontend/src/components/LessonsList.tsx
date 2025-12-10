import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import LessonCard from "./LessonCard";

const lessonsData = [
  {
    id: 1,
    title: "Basic Greetings",
    description: "Learn essential greetings and polite expressions in Vietnamese",
    level: "beginner" as const,
    duration: "15 min",
    progress: 75,
  },
  {
    id: 2,
    title: "Family Members",
    description: "Vocabulary for family relationships and how to introduce your family",
    level: "beginner" as const,
    duration: "20 min",
    progress: 30,
  },
  {
    id: 3,
    title: "Food & Drinks",
    description: "Common food and beverage vocabulary for ordering at restaurants",
    level: "beginner" as const,
    duration: "25 min",
  },
  {
    id: 4,
    title: "Numbers & Counting",
    description: "Master Vietnamese numbers and learn to count, tell time, and prices",
    level: "beginner" as const,
    duration: "18 min",
  },
  {
    id: 5,
    title: "Daily Routines",
    description: "Describe your daily activities and understand time expressions",
    level: "intermediate" as const,
    duration: "30 min",
  },
  {
    id: 6,
    title: "Shopping & Bargaining",
    description: "Learn vocabulary and phrases for shopping at markets and stores",
    level: "intermediate" as const,
    duration: "28 min",
  },
  {
    id: 7,
    title: "Vietnamese Idioms",
    description: "Explore common Vietnamese idioms and their cultural meanings",
    level: "advanced" as const,
    duration: "35 min",
  },
  {
    id: 8,
    title: "Business Vietnamese",
    description: "Professional vocabulary and expressions for workplace communication",
    level: "advanced" as const,
    duration: "40 min",
  },
];

const LessonsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filteredLessons = lessonsData.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || lesson.level === levelFilter;
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} {...lesson} />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No lessons found. Try a different search term or filter.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LessonsList;
