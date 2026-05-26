import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Award, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  SlidersHorizontal, 
  AlertTriangle,
  Check
} from "lucide-react";

import {
  callGetAllPoints,
  callUpdatePoint,
  callDeletePoint,
  callSearchPoints,
} from "@/config/api";
import { IPointSearchRequest, PointResponse } from "@/types/common.type";

const PointsManagement = () => {
  const [points, setPoints] = useState<PointResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // search form
  const [search, setSearch] = useState<IPointSearchRequest>({
    keyword: "",
    username: "",
    gameName: "",
    minScore: undefined,
    maxScore: undefined,
  });

  const [showSearch, setShowSearch] = useState<boolean>(false);

  // track whether current view is search results
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // dialog / edit states
  const [editing, setEditing] = useState<PointResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [form, setForm] = useState<{ total?: number }>({ total: 0 });

  // delete confirm states
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Dynamic live search as filters change
  useEffect(() => {
    const hasFilters = !!(
      search.keyword.trim() ||
      search.username.trim() ||
      search.gameName.trim() ||
      search.minScore !== undefined ||
      search.maxScore !== undefined
    );
    setIsSearching(hasFilters);
    setPage(0); // Go back to first page when search filters change
  }, [search.keyword, search.username, search.gameName, search.minScore, search.maxScore]);

  useEffect(() => {
    // nếu đang ở chế độ search -> gọi search, ngược lại gọi getAll
    if (isSearching) {
      handleSearch(page);
    } else {
      fetchPoints(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, isSearching]);

  const extractPage = (res: any) => {
    const d = res?.data ?? res;

    // case 1: ApiPagination builder style { meta: { current, pageSize, pages, total }, result: [...] }
    if (d?.result && d?.meta) {
      return {
        content: d.result,
        totalPages: d.meta.pages ?? 1,
        totalElements: d.meta.total ?? 0,
        number:
          typeof d.meta.current === "number"
            ? Math.max(0, d.meta.current - 1)
            : 0,
      };
    }

    // case 2: PageDto / PageImpl style { content, totalPages, totalElements, number }
    const payload = d?.data ?? d;
    const pageObj = payload?.content ? payload : d;
    return {
      content: pageObj?.content ?? pageObj?.data ?? [],
      totalPages: pageObj?.totalPages ?? pageObj?.pages ?? 1,
      totalElements: pageObj?.totalElements ?? pageObj?.total ?? 0,
      number: pageObj?.number ?? (pageObj?.current ? pageObj.current - 1 : 0),
    };
  };

  // Accept optional page parameter to avoid TS errors when callers pass page
  const fetchPoints = async (p?: number) => {
    try {
      setLoading(true);
      if (typeof p === "number") {
        setPage(p);
      }
      const usePage = typeof p === "number" ? p : page;
      const res = await callGetAllPoints(usePage, size);
      const pageData = extractPage(res);
      setPoints(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      if (page !== pageData.number) {
        setPage(pageData.number);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lấy điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (p: PointResponse) => {
    setEditing(p);
    const total = p.totalScore ?? (p.score ?? 0) + (p.bonus ?? 0);
    setForm({ total });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const currentBonus = editing.bonus ?? 0;
      const desiredTotal = Number(form.total ?? 0);

      let scoreToSend = 0;
      let bonusToSend = currentBonus;

      if (desiredTotal >= currentBonus) {
        scoreToSend = desiredTotal - currentBonus;
        bonusToSend = currentBonus;
      } else {
        scoreToSend = 0;
        bonusToSend = desiredTotal;
      }

      await callUpdatePoint(editing.id, {
        score: scoreToSend,
        bonus: bonusToSend,
      });
      toast.success("Cập nhật điểm thành công");
      setDialogOpen(false);
      setEditing(null);
      if (isSearching) {
        handleSearch(page);
      } else {
        fetchPoints();
      }
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  const openDeleteConfirm = (p: PointResponse) => {
    setDeleteTarget({
      id: p.id,
      label: `${p.userName ?? p.userId ?? ""} — ${p.gameName ?? ""}`,
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await callDeletePoint(id);
      toast.success("Xóa điểm thành công");
      const isLastItemOnPage = points.length === 1 && page > 0;
      if (isLastItemOnPage) {
        setPage((prev) => Math.max(0, prev - 1));
      } else {
        if (isSearching) {
          handleSearch(page);
        } else {
          fetchPoints();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    await handleDelete(id);
  };

  const handleSearch = async (p = 0) => {
    try {
      setLoading(true);
      const payload: any = {};
      if (search.keyword) payload.keyword = search.keyword;
      if (search.username) payload.username = search.username;
      if (search.gameName) payload.gameName = search.gameName;
      if (search.minScore !== undefined)
        payload.minScore = Number(search.minScore);
      if (search.maxScore !== undefined)
        payload.maxScore = Number(search.maxScore);
      const res = await callSearchPoints(payload, p, size);
      const pageData = extractPage(res);
      setPoints(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setPage(pageData.number);
    } catch (err) {
      console.error(err);
      toast.error("Tìm kiếm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearch({
      keyword: "",
      username: "",
      gameName: "",
      minScore: undefined,
      maxScore: undefined,
    });
    setIsSearching(false);
    setPage(0);
    fetchPoints(0);
  };

  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));

  // Compute live local statistics for premium insight cards
  const highestScoreOnPage = points.length 
    ? Math.max(...points.map(p => p.totalScore ?? (p.score ?? 0) + (p.bonus ?? 0))) 
    : 0;
  
  const averageScoreOnPage = points.length 
    ? Math.round(points.reduce((sum, p) => sum + (p.totalScore ?? (p.score ?? 0) + (p.bonus ?? 0)), 0) / points.length) 
    : 0;

  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  if (loading && points.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-md rounded-xl">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5 animate-spin text-gray-400" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* DYNAMIC STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Records</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalElements}</h3>
                <p className="text-sm text-primary mt-2 font-medium">All logged transactions</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Highest on Page</p>
                <h3 className="text-3xl font-bold text-gray-900">{highestScoreOnPage}</h3>
                <p className="text-sm text-green-600 mt-2 font-medium">Top student score here</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Average on Page</p>
                <h3 className="text-3xl font-bold text-gray-900">{averageScoreOnPage}</h3>
                <p className="text-sm text-red-500 mt-2 font-medium">Mean scores list</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN POINTS TABLE CARD */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Points Management</CardTitle>
              <CardDescription className="text-gray-500 mt-1">Manage student point transactions and leaderboard details</CardDescription>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
            {/* Live dynamic quick search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Quick search user or game..."
                className="pl-9 pr-9 h-10 w-full sm:w-80 bg-gray-50/50 border-gray-200 rounded-xl text-sm"
                value={search.keyword}
                onChange={(e) =>
                  setSearch({ ...search, keyword: e.target.value })
                }
              />
              {search.keyword && (
                <X
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => setSearch({ ...search, keyword: "" })}
                />
              )}
            </div>

            {/* Advanced Filters & Reset buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSearch((s) => !s)}
                variant="outline"
                className={`gap-2 rounded-xl h-10 px-4 text-sm font-semibold transition-all border-gray-200 ${
                  showSearch 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700" 
                    : "bg-gray-50/50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showSearch ? "Hide Filters" : "Advanced Filters"}
              </Button>

              <Button
                onClick={handleResetSearch}
                variant="ghost"
                className="gap-2 rounded-xl h-10 px-4 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Advanced Filters Drawer Panel */}
        {showSearch && (
          <div className="mx-6 mb-4 p-5 rounded-2xl bg-gray-50/60 border border-gray-100/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">User Name</Label>
              <Input
                className="w-full h-10 bg-white border-gray-200 rounded-xl text-sm"
                value={search.username}
                onChange={(e) =>
                  setSearch({ ...search, username: e.target.value })
                }
                placeholder="Search username"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Game Name</Label>
              <Input
                className="w-full h-10 bg-white border-gray-200 rounded-xl text-sm"
                value={search.gameName}
                onChange={(e) =>
                  setSearch({ ...search, gameName: e.target.value })
                }
                placeholder="Search game name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Min Score</Label>
              <Input
                className="w-full h-10 bg-white border-gray-200 rounded-xl text-sm"
                type="number"
                value={search.minScore ?? ""}
                onChange={(e) =>
                  setSearch({
                    ...search,
                    minScore: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="Min score"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Max Score</Label>
              <Input
                className="w-full h-10 bg-white border-gray-200 rounded-xl text-sm"
                type="number"
                value={search.maxScore ?? ""}
                onChange={(e) =>
                  setSearch({
                    ...search,
                    maxScore: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="Max score"
              />
            </div>
          </div>
        )}

        {/* TABLE CONTAINER */}
        <CardContent className="p-0">
          <div className="overflow-x-auto relative rounded-xl border border-gray-100 mx-6 mb-6">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="w-24 pl-6 py-3.5">ID</TableHead>
                  <TableHead className="py-3.5">User Name</TableHead>
                  <TableHead className="py-3.5">Game Name</TableHead>
                  <TableHead className="py-3.5">Total Score</TableHead>
                  <TableHead className="text-right pr-6 py-3.5">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {points.map((p) => {
                  const total = p.totalScore ?? (p.score ?? 0) + (p.bonus ?? 0);

                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                    >
                      <TableCell className="pl-6 font-semibold text-gray-700 py-4">
                        {p.id}
                      </TableCell>

                      <TableCell className="font-medium text-gray-800 py-4">
                        {p.userName || "-"}
                      </TableCell>

                      <TableCell className="text-gray-500 py-4">
                        {p.gameName || "-"}
                      </TableCell>

                      <TableCell className="font-bold text-gray-900 py-4">
                        {total}
                      </TableCell>

                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            onClick={() => openEditDialog(p)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteConfirm(p)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && points.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No point transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* BEAUTIFUL PAGINATION CONTROLS */}
          {points.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{startItem}-{endItem}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalElements}</span> point records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={page === 0 || loading}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs((page + 1) - p) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-xs text-gray-400">...</span>}
                      <button
                        onClick={() => setPage(p - 1)}
                        disabled={loading}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                          page === p - 1
                            ? "bg-[#ff6b6b] text-white shadow-md transform scale-105"
                            : "bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={goNext}
                  disabled={page + 1 >= totalPages || loading}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Score Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-[#ff6b6b]" />
              Edit Student Score
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Student User</Label>
              <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 font-semibold text-sm text-gray-700">
                {editing?.userName || editing?.userId || "-"}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Game Code</Label>
              <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 font-semibold text-sm text-gray-700">
                {editing?.gameName || editing?.gameId || "-"}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="total" className="text-xs font-semibold text-gray-500">Total Score</Label>
              <Input
                id="total"
                type="number"
                value={form.total}
                className="rounded-xl border-gray-200 h-10 font-bold text-gray-900"
                onChange={(e) =>
                  setForm({ ...form, total: Number(e.target.value) })
                }
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200"
              onClick={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Update Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Delete Point Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2 text-gray-500">
              Are you sure you want to delete the score record for <strong>{deleteTarget?.label ?? ""}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel 
              className="rounded-xl border-gray-200"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={confirmDelete}
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PointsManagement;
