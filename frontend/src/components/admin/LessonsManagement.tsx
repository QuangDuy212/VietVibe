import React, { useEffect, useState } from "react";
import {
  callFetchLessonsPaginated,
  callDeleteLesson,
  callRestoreLesson,
  callCountAllLessons,
  callCountActiveLessons,
  callCountDeletedLessons
} from "@/config/api";
import { ILesson } from "@/types/common.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, Plus, Edit, Trash2, User, Calendar, ChevronLeft, ChevronRight, Eye, RefreshCw, CheckCircle2, RotateCcw, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const levelColors: Record<string, string> = {
  BEGINNER: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  INTERMEDIATE: "bg-accent/10 text-accent hover:bg-accent/20",
  ADVANCE: "bg-primary/10 text-primary hover:bg-primary/20",
};

interface LessonsManagementProps {
  onCreateLesson?: () => void;
  onEditLesson?: (lesson: ILesson) => void;
  onViewLesson?: (lesson: ILesson) => void;
}

const LessonsManagement = ({ onCreateLesson, onEditLesson, onViewLesson }: LessonsManagementProps) => {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionTarget, setActionTarget] = useState<{
    id: string;
    label: string;
    action: "delete" | "restore" | "bulkDelete" | "bulkRestore";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLessons, setTotalLessons] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "deleted">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
    fetchLessons();
  }, [page, pageSize, activeTab, searchQuery]);

  const fetchStats = async () => {
    try {
      const [total, active, deleted] = await Promise.all([
        callCountAllLessons(),
        callCountActiveLessons(),
        callCountDeletedLessons()
      ]);
      setStats({
        total: total?.data?.count || 0,
        active: active?.data?.count || 0,
        deleted: deleted?.data?.count || 0
      });
    } catch (e) {
      console.error("Failed to fetch lesson stats", e);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      let filterStr = "";
      if (activeTab === "active") filterStr = `deleted:false`;
      else if (activeTab === "deleted") filterStr = `deleted:true`;
      
      if (searchQuery) {
        const titleQuery = `lessontitle~'${searchQuery}'`;
        filterStr = filterStr ? `(${filterStr}) and (${titleQuery})` : titleQuery;
      }

      const res = await callFetchLessonsPaginated(page, pageSize, filterStr);
      if (res?.data) {
        const data = res.data as unknown as { result: ILesson[], meta: { total: number } };
        setLessons(data.result || []);
        setTotalLessons(data.meta?.total || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch lesson list");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === lessons.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(lessons.map((l) => l._id)));
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const openConfirm = (id: string, label: string, action: "delete" | "restore") => {
    setActionTarget({ id, label, action });
  };

  const openBulkConfirm = (action: "bulkDelete" | "bulkRestore") => {
    setActionTarget({ id: "", label: `${selectedIds.size} lesson${selectedIds.size > 1 ? "s" : ""}`, action });
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === "delete") {
        await callDeleteLesson(actionTarget.id);
        toast.success("Lesson moved to trash");
      } else if (actionTarget.action === "restore") {
        await callRestoreLesson(actionTarget.id);
        toast.success("Lesson restored");
      } else if (actionTarget.action === "bulkDelete") {
        await Promise.all([...selectedIds].map((id) => callDeleteLesson(id)));
        toast.success(`${selectedIds.size} lesson(s) moved to trash`);
      } else if (actionTarget.action === "bulkRestore") {
        await Promise.all([...selectedIds].map((id) => callRestoreLesson(id)));
        toast.success(`${selectedIds.size} lesson(s) restored`);
      }
      setSelectedIds(new Set());
      fetchLessons();
      fetchStats();
    } catch (error) {
      toast.error("An error occurred while processing the request");
    }
    setActionTarget(null);
  };

  const totalPages = Math.ceil(totalLessons / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Lessons</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-primary mt-2 font-medium">All registered lessons</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Lessons</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.active}</h3>
                <p className="text-sm text-green-600 mt-2 font-medium">Currently active</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Deleted Lessons</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.deleted}</h3>
                <p className="text-sm text-red-500 mt-2 font-medium">Moved to trash</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TABLE */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Lesson Management</CardTitle>
              <CardDescription className="text-gray-500 mt-1">Create, manage, and organize all lessons</CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
            <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-full border border-gray-100">
              {(["all", "active", "deleted"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 capitalize ${
                    activeTab === tab
                      ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/20"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-gray-50/50 border-gray-200 rounded-xl"
              />
              <Button onClick={onCreateLesson} className="gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shrink-0">
                <Plus className="h-4 w-4" />
                Add Lesson
              </Button>
            </div>
          </div>

          {/* Bulk Actions Banner */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-4 px-5 py-3.5 rounded-xl bg-red-50 border border-red-100">
              <span className="text-base font-semibold text-red-600">
                {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <div className="ml-auto flex items-center gap-3">
                {activeTab === "active" && (
                  <Button onClick={() => openBulkConfirm("bulkDelete")} variant="outline" className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 h-10 px-5 font-medium">
                    <Trash2 className="h-5 w-5" /> Move to Trash
                  </Button>
                )}
                {activeTab === "deleted" && (
                  <Button onClick={() => openBulkConfirm("bulkRestore")} variant="outline" className="gap-2 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 h-10 px-5 font-medium">
                    <RotateCcw className="h-5 w-5" /> Restore
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  {activeTab !== "all" && (
                    <TableHead className="w-[50px] pl-6 h-12">
                      <Checkbox
                        checked={lessons.length > 0 && selectedIds.size === lessons.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-sm font-semibold text-gray-600 h-12">Lesson Title</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-600 h-12">Video URL</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-600 h-12">Description</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-600 h-12">Level</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-600 h-12">Created</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-600 text-right pr-6 h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "all" ? 6 : 7} className="h-32 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        Loading lessons...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : lessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "all" ? 6 : 7} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-gray-300" />
                        <p className="text-sm">No lessons found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons.map((lesson) => (
                    <TableRow key={lesson._id} className={`border-b border-gray-100 transition-colors ${activeTab === "deleted" ? "bg-red-50/30" : "hover:bg-gray-50/50"}`}>
                      {activeTab !== "all" && (
                        <TableCell className="pl-6 py-4">
                          <Checkbox
                            checked={selectedIds.has(lesson._id)}
                            onCheckedChange={() => toggleSelect(lesson._id)}
                            aria-label={`Select ${lesson.lessontitle}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm text-gray-900">{lesson.lessontitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 max-w-[150px] truncate text-muted-foreground text-sm">{lesson.videourl || "—"}</TableCell>
                      <TableCell className="py-4 max-w-xs truncate text-muted-foreground text-sm">{lesson.description || "—"}</TableCell>
                      <TableCell className="py-4">
                        <Badge className={levelColors[lesson.level] || "bg-gray-100 text-gray-600"}>
                          {lesson.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-500">
                        {lesson.createdAt ? format(new Date(lesson.createdAt), "dd/MM/yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {activeTab === "deleted" ? (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => openConfirm(lesson._id, lesson.lessontitle, "restore")} className="h-8 w-8 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50" title="Restore Lesson">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openConfirm(lesson._id, lesson.lessontitle, "delete")} className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Delete permanently">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => onViewLesson?.(lesson)} className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => onEditLesson?.(lesson)} className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openConfirm(lesson._id, lesson.lessontitle, "delete")} className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="More">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          {lessons.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{lessons.length}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalLessons}</span> lessons
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-xs text-gray-400">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                          page === p
                            ? "bg-[#ff6b6b] text-white shadow-md transform scale-105"
                            : "bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {actionTarget?.action === "restore" || actionTarget?.action === "bulkRestore" ? "Restore Lessons?" : "Move to Trash?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 mt-2">
              {actionTarget?.action === "delete" && `Are you sure you want to move "${actionTarget.label}" to trash?`}
              {actionTarget?.action === "restore" && `Are you sure you want to restore "${actionTarget.label}"?`}
              {actionTarget?.action === "bulkDelete" && `Are you sure you want to move ${actionTarget.label} to trash?`}
              {actionTarget?.action === "bulkRestore" && `Are you sure you want to restore ${actionTarget.label}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              className={`rounded-xl text-white ${
                actionTarget?.action === "restore" || actionTarget?.action === "bulkRestore"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-destructive"
              }`}
            >
              {actionTarget?.action === "restore" || actionTarget?.action === "bulkRestore" ? "Restore" : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonsManagement;
