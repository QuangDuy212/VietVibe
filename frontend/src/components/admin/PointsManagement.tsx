import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Award, Edit, Trash2 } from "lucide-react";

import {
  callGetAllPoints,
  callUpdatePoint,
  callDeletePoint,
  callSearchPoints,
} from "@/config/api";

interface PointItem {
  id: number;
  userId?: string;
  userName?: string;
  gameId?: number;
  gameName?: string;
  score?: number;
  bonus?: number;
  totalScore?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  createdAt?: string;
}

const PointsManagement = () => {
  const [points, setPoints] = useState<PointItem[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // search form
  const [search, setSearch] = useState<any>({
    keyword: "",
    username: "",
    gameName: "",
    minScore: "",
    maxScore: "",
  });

  const [showSearch, setShowSearch] = useState<boolean>(false);

  // track whether current view is search results
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // dialog / edit states
  const [editing, setEditing] = useState<PointItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [form, setForm] = useState<{ total?: number }>({ total: 0 });

  // delete confirm states
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

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
        // update local page state before request so UI reflects intended page
        setPage(p);
      }
      const usePage = typeof p === "number" ? p : page;
      const res = await callGetAllPoints(usePage, size);
      const pageData = extractPage(res);
      setPoints(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      // setPage(pageData.number); // sync with server response
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

  const openEditDialog = (p: PointItem) => {
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
      // refresh current page (no arg required)
      fetchPoints();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  const openDeleteConfirm = (p: PointItem) => {
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
      // nếu xóa item trên trang cuối khiến trang rỗng, kéo về trang trước
      const isLastItemOnPage = points.length === 1 && page > 0;
      if (isLastItemOnPage) {
        setPage((prev) => Math.max(0, prev - 1));
      } else {
        fetchPoints();
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
    setIsSearching(true);
    try {
      setLoading(true);
      const payload: any = {};
      if (search.keyword) payload.keyword = search.keyword;
      if (search.username) payload.username = search.username;
      if (search.gameName) payload.gameName = search.gameName;
      if (search.minScore) payload.minScore = Number(search.minScore);
      if (search.maxScore) payload.maxScore = Number(search.maxScore);
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
      minScore: "",
      maxScore: "",
    });
    setIsSearching(false);
    setPage(0);
    fetchPoints(0);
  };

  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Points Management
              </CardTitle>
              <CardDescription>Total Points: {totalElements}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearch((s) => !s)}
              >
                {showSearch ? "Hide Search" : "Show Search"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showSearch && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div className="md:col-span-2">
                <Label>Keyword</Label>
                <Input
                  className="w-full h-12"
                  value={search.keyword}
                  onChange={(e) =>
                    setSearch({ ...search, keyword: e.target.value })
                  }
                  placeholder="Username or Gamename"
                />
              </div>

              <div className="md:col-span-2">
                <Label>User Name</Label>
                <Input
                  className="w-full h-12"
                  value={search.username}
                  onChange={(e) =>
                    setSearch({ ...search, username: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Game Name</Label>
                <Input
                  className="w-full h-12"
                  value={search.gameName}
                  onChange={(e) =>
                    setSearch({ ...search, gameName: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Min score</Label>
                <Input
                  className="w-full h-12"
                  type="number"
                  value={search.minScore}
                  onChange={(e) =>
                    setSearch({ ...search, minScore: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Max score</Label>
                <Input
                  className="w-full h-12"
                  type="number"
                  value={search.maxScore}
                  onChange={(e) =>
                    setSearch({ ...search, maxScore: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 flex items-end md:justify-end">
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setIsSearching(true);
                      setPage(0);
                    }}
                    className="h-10"
                  >
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetSearch}
                    className="h-10"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table className="table-fixed w-full text-center">
              <TableHeader>
                <TableRow className="bg-muted/50 h-12">
                  <TableHead className="w-28 text-center">ID</TableHead>
                  <TableHead className="text-center">User Name</TableHead>
                  <TableHead className="text-center">Game Name</TableHead>
                  <TableHead className="text-center">
                    Total Score
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {points.map((p) => {
                  const total = p.totalScore ?? (p.score ?? 0) + (p.bonus ?? 0);

                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/30 h-14 border-b"
                    >
                      <TableCell className="text-center font-medium">
                        {p.id}
                      </TableCell>

                      <TableCell>{p.userName || "-"}</TableCell>

                      <TableCell>{p.gameName || "-"}</TableCell>

                      <TableCell className="text-center font-semibold">
                        {total}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => openEditDialog(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            onClick={() => openDeleteConfirm(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page + 1} of {totalPages} — total {totalElements}{" "}
              items
            </div>
            <div className="flex items-center gap-3 text-sm ">
              {/* First page */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="h-6 min-h-0 px-1 py-0 text-[10px] leading-none"
              >
                {"<<"}
              </Button>

              {/* Previous page */}
              <Button
                size="sm"
                variant="outline"
                onClick={goPrev}
                disabled={page === 0}
                className="h-6 min-h-0 px-1 py-0 text-[10px] leading-none"
              >
                {"<"}
              </Button>

              {/* Page numbers (hiển thị 3 trang lân cận) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p < page || p > page + 2) return null; // tối đa 3 trang gần trang hiện tại
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={p - 1 === page ? "default" : "outline"}
                    onClick={() => setPage(p - 1)}
                    className="px-1 py-0.5 text-[10px] min-w-[1.5rem]"
                  >
                    {p}
                  </Button>
                );
              })}

              {/* Next page */}
              <Button
                size="sm"
                variant="outline"
                onClick={goNext}
                disabled={page + 1 >= totalPages}
                className="h-6 min-h-0 px-1 py-0 text-[10px] leading-none"
              >
                {">"}
              </Button>

              {/* Last page */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(totalPages - 1)}
                disabled={page + 1 >= totalPages}
                className="h-6 min-h-0 px-1 py-0 text-[10px] leading-none"
              >
                {">>"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Total Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <div className="p-2 border rounded">
                {editing?.userName || editing?.userId || "-"}
              </div>
            </div>
            <div>
              <Label>Game</Label>
              <div className="p-2 border rounded">
                {editing?.gameName || editing?.gameId || "-"}
              </div>
            </div>
            <div>
              <Label htmlFor="total">Total Score</Label>
              <Input
                id="total"
                type="number"
                value={form.total}
                onChange={(e) =>
                  setForm({ ...form, total: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.label ?? ""}</strong>? This action cannot be
            undone.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-destructive text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PointsManagement;
