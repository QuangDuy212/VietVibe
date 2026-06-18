import { useState, useEffect, useCallback } from "react";
import { callFetchLessonsPaginated } from "@/config/api";

export interface LessonWithProgress {
  _id: string;
  lessontitle: string;
  videourl: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCE";
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

export const useLessons = (pageSize: number = 5, initialLevel: string = "ALL") => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<string>(initialLevel); // "ALL", "BEGINNER", "INTERMEDIATE", "ADVANCE"

  // Thêm state để lưu số bài hoàn thành thực tế trên toàn hệ thống
  const [globalCompletedCount, setGlobalCompletedCount] = useState<number>(0);

  const fetchLessons = useCallback(async (p?: number, activeLevel?: string) => {
    try {
      setLoading(true);
      setError(null);

      const usePage = typeof p === "number" ? p : page;
      const currentLevel = activeLevel || level;

      // Build the Turkraft spring-filter query
      let filterQuery = "";
      if (currentLevel !== "ALL") {
        filterQuery = `level:'${currentLevel}'`;
      }

      // 1. Fetch dữ liệu phân trang cho danh sách hiển thị
      const response = await callFetchLessonsPaginated(usePage, pageSize, filterQuery);
      
      if (response.statusCode !== 200) {
        throw new Error("Non-200 response");
      }

      // Lọc bỏ các lesson đã bị soft delete trước khi set state
      const activeResult = (response.data.result as LessonWithProgress[]).filter(
        (l: any) => l.deleted !== true
      );
      setLessons(activeResult);
      setTotalPages(response.data.meta.pages);
      setTotalElements(response.data.meta.total);
      
      const pageNumberFromApi = response.data.meta.current;
      if (page !== pageNumberFromApi) {
        setPage(pageNumberFromApi);
      }

      // 2. Fetch dữ liệu tổng quát của level đó để đếm số bài hoàn thành thực tế
      const resFull = await callFetchLessonsPaginated(1, 100, filterQuery);
      if (resFull?.data?.result) {
        const allLessons = (resFull.data.result as any[]).filter(
          (l) => l.deleted !== true
        );
        const count = allLessons.filter(
          (l) => l.progress === 100 || l.completed === true
        ).length;
        setGlobalCompletedCount(count);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch lessons");
      console.error("❌ Fetch lessons error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, level]);

  useEffect(() => {
    fetchLessons(page, level);
  }, [page, pageSize, level]);

  const updateLessonProgress = useCallback((lessonId: string, progress: number) => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson._id === lessonId
          ? { ...lesson, progress, completed: progress === 100 }
          : lesson
      )
    );
    // Nếu cập nhật bài học thành 100%, tăng số lượng tổng lên
    if (progress === 100) {
      setGlobalCompletedCount(prev => prev + 1);
    }
  }, []);

  // Sửa: Tính % dựa trên số lượng tổng (Global)
  const getOverallProgress = useCallback(() => {
    if (totalElements === 0) return 0;
    return Math.round((globalCompletedCount / totalElements) * 100);
  }, [globalCompletedCount, totalElements]);

  // Sửa: Trả về stats dựa trên số lượng tổng (Global)
  const getStats = useCallback(() => {
    // Lưu ý: totalExercises và hoursSpent vẫn tính trên các bài hiện tại
    const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises, 0);
    const completedExercises = lessons
      .filter(l => l.progress === 100)
      .reduce((sum, lesson) => sum + lesson.exercises, 0);

    return {
      completedLessons: globalCompletedCount, // Dùng số tổng đã tính ở fetchLessons
      totalLessons: totalElements,
      totalExercises,
      completedExercises,
      hoursSpent: Math.round(lessons.reduce((sum, lesson) => sum + (lesson.exercises * 0.01), 0))
    };
  }, [lessons, totalElements, globalCompletedCount]);

  const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const goToPage = (newPage: number) => setPage(newPage);
  const goFirst = () => setPage(1);
  const goLast = () => setPage(totalPages);

  const changeLevel = (newLevel: string) => {
    setLevel(newLevel);
    setPage(1);
  };

  return {
    lessons,
    page,
    totalPages,
    totalElements,
    pageSize,
    level,
    changeLevel,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    loading,
    error,
    refetch: () => fetchLessons(page, level),
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