import { useState, useEffect, useCallback } from "react";
import { callFetchLessonsPaginated } from "@/config/api";
import { ILesson } from "@/types/common.type";

export interface LessonWithProgress {
  _id: string;
  lessontitle: string;
  videourl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  progress: number;
  completed: boolean;
  locked: boolean;
  exercises: number;
  time: string;
}

export const useLessons = (pageSize: number = 5) => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 
  const extractPage = (res: any) => {
    const d = res?.data ?? res;

    if (d?.result && d?.meta) {
      return {
        content: d.result,
        totalPages: d.meta.pages ?? 1,
        totalElements: d.meta.total ?? 0,
        number: typeof d.meta.current === "number" ? d.meta.current : 1,
      };
    }

    const payload = d?.data ?? d;
    const pageObj = payload?.content ? payload : d;
    return {
      content: pageObj?.content ?? pageObj?.data ?? [],
      totalPages: pageObj?.totalPages ?? pageObj?.pages ?? 1,
      totalElements: pageObj?.totalElements ?? pageObj?.total ?? 0,
      number: pageObj?.number ?? (pageObj?.current ?? 1),
    };
  };

  const fetchLessons = useCallback(async (p?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (typeof p === "number") {
        setPage(p);
      }
      const usePage = typeof p === "number" ? p : page;
      
      const response = await callFetchLessonsPaginated(usePage, pageSize);
      const pageData = extractPage(response);
      
      if (pageData.content && Array.isArray(pageData.content)) {
        const lessonsData = pageData.content as ILesson[];
        
        const mockProgressData = [
          { progress: 100, completed: true, locked: false, exercises: 12, time: "15 min" },
          { progress: 100, completed: true, locked: false, exercises: 10, time: "12 min" },
          { progress: 0, completed: false, locked: false, exercises: 15, time: "18 min" },
          { progress: 0, completed: false, locked: true, exercises: 20, time: "25 min" },
          { progress: 0, completed: false, locked: true, exercises: 14, time: "16 min" },
          { progress: 0, completed: false, locked: true, exercises: 18, time: "22 min" },
          { progress: 0, completed: false, locked: true, exercises: 16, time: "20 min" },
          { progress: 0, completed: false, locked: true, exercises: 22, time: "28 min" },
        ];

        const lessonsWithProgress: LessonWithProgress[] = lessonsData.map((lesson: ILesson, index: number) => {
          const globalIndex = (usePage - 1) * pageSize + index;
          const progressData = mockProgressData[globalIndex] || { 
            progress: 0, 
            completed: false, 
            locked: globalIndex >= 3,
            exercises: 15, 
            time: "20 min" 
          };
          
          return {
            ...lesson,
            progress: progressData.progress,
            completed: progressData.completed,
            locked: progressData.locked,
            exercises: progressData.exercises,
            time: progressData.time,
          };
        });

        setLessons(lessonsWithProgress);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        
        if (page !== pageData.number) {
          setPage(pageData.number);
        }
        
        console.log("✅ Lessons paginated:", {
          currentPage: pageData.number,
          totalPages: pageData.totalPages,
          totalElements: pageData.totalElements,
          lessons: lessonsWithProgress.length
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch lessons");
      console.error("❌ Fetch lessons error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLessons(page);
  }, [page, pageSize]);

  const updateLessonProgress = useCallback((lessonId: string, progress: number) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson._id === lessonId 
          ? { ...lesson, progress, completed: progress === 100 }
          : lesson
      )
    );
  }, []);

  const getOverallProgress = useCallback(() => {
    if (totalElements === 0) return 0;
    const completed = lessons.filter(l => l.completed).length;
    return Math.round((completed / totalElements) * 100);
  }, [lessons, totalElements]);

  const getStats = useCallback(() => {
    const completedLessons = lessons.filter(l => l.completed);
    const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises, 0);
    const completedExercises = completedLessons.reduce((sum, lesson) => sum + lesson.exercises, 0);
    
    return {
      completedLessons: completedLessons.length,
      totalLessons: totalElements,
      totalExercises,
      completedExercises,
      hoursSpent: Math.round(lessons.reduce((sum, lesson) => sum + (lesson.exercises * 0.01), 0))
    };
  }, [lessons, totalElements]);

  const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const goToPage = (newPage: number) => setPage(newPage);
  const goFirst = () => setPage(1);
  const goLast = () => setPage(totalPages);

  return {
    lessons,
    page,
    totalPages,
    totalElements,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    loading,
    error,
    refetch: () => fetchLessons(page),
    goToPage,
    nextPage: goNext,
    prevPage: goPrev,
    goFirst,
    goLast,
    updateLessonProgress,
    overallProgress: getOverallProgress(),
    stats: getStats(),
  };
};