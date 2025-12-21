import { useState, useEffect, useCallback } from "react";
import { callFetchLessonsPaginated } from "@/config/api";

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

  // Thêm state để lưu số bài hoàn thành thực tế trên toàn hệ thống
  const [globalCompletedCount, setGlobalCompletedCount] = useState<number>(0);

  const fetchLessons = useCallback(async (p?: number) => {
    try {
      setLoading(true);
      setError(null);

      const usePage = typeof p === "number" ? p : page;

      // 1. Fetch dữ liệu phân trang cho danh sách hiển thị
      const response = await callFetchLessonsPaginated(usePage, pageSize);
      
      if (response.statusCode !== 200) {
        throw new Error("Non-200 response");
      }

      setLessons(response.data.result);
      setTotalPages(response.data.meta.pages);
      setTotalElements(response.data.meta.total);
      
      const pageNumberFromApi = response.data.meta.current;
      if (page !== pageNumberFromApi) {
        setPage(pageNumberFromApi);
      }

      // 2. Fetch dữ liệu tổng quát để đếm số bài hoàn thành (Giống logic Profile)
      // Chúng ta fetch 100 bài để đảm bảo quét hết các bài đã làm ở các trang khác
      const resFull = await callFetchLessonsPaginated(1, 100);
      if (resFull?.data?.result) {
        const allLessons = resFull.data.result as any[];
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
    // Lưu ý: totalExercises và hoursSpent vẫn tính trên 5 bài hiện tại (có thể sửa nếu cần)
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