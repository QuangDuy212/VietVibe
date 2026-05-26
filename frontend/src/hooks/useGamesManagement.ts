import { useEffect, useState } from "react";
import {
  callGetGames,
  callDeleteGame,
  callRestoreGame,
  callCountAllGames,
  callCountActiveGames,
  callCountDeletedGames
} from "@/config/api";
import {
  IBackendRes,
  IGame,
  IPaginationRes,
} from "@/types/common.type";
import { toast } from "sonner";

export const useGamesManagement = () => {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // search & filter
  type GameType = IGame["type"];
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | GameType>("ALL");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "deleted">("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionTarget, setActionTarget] = useState<{
    id: string;
    label: string;
    action: "delete" | "restore" | "bulkDelete" | "bulkRestore";
  } | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 });

  useEffect(() => {
    fetchStats();
    fetchGames(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [total, active, deleted] = await Promise.all([
        callCountAllGames(),
        callCountActiveGames(),
        callCountDeletedGames()
      ]);
      setStats({
        total: total?.data?.count || 0,
        active: active?.data?.count || 0,
        deleted: deleted?.data?.count || 0
      });
    } catch (e) {
      console.error("Failed to fetch game stats", e);
    }
  };

  // ====== SEARCH & FILTER: build expression cho BE (spring-filter) ======
  const buildFilterExpression = () => {
    const parts: string[] = [];
    const keyword = searchKeyword.trim();

    if (keyword) {
      // escape dấu nháy đơn trong keyword để không vỡ string
      const escaped = keyword.replace(/'/g, "\\'");
      // spring-filter: ~ = like, dùng '%' trong string, và dùng NHÁY ĐƠN
      parts.push(`(name ~ '%${escaped}%' or description ~ '%${escaped}%')`);
    }

    if (typeFilter !== "ALL") {
      parts.push(`type : '${typeFilter}'`);
    }

    if (activeTab === "active") parts.push("deleted: false");
    else if (activeTab === "deleted") parts.push("deleted: true");

    return parts.join(" and ");
  };

  // ====== FETCH LIST (BE filter + BE pagination) ======
  const fetchGames = async (
    pageParam: number = page,
    pageSizeParam: number = pageSize
  ) => {
    try {
      setLoading(true);
      setSelectedIds(new Set());

      const filterExpr = buildFilterExpression();

      const res = (await callGetGames(
        pageParam,
        pageSizeParam,
        filterExpr || undefined
      )) as unknown as IBackendRes<IPaginationRes<IGame>>;

      const pagination = res.data;
      const result = pagination?.result ?? [];
      setGames(result);

      const meta = pagination?.meta;
      if (meta) {
        setPage(typeof meta.current === "number" ? meta.current : pageParam);
        setPageSize(
          typeof meta.pageSize === "number" ? meta.pageSize : pageSizeParam
        );
        setTotalPages(meta.pages ?? 1);
        setTotalItems(meta.total ?? result.length);
      } else {
        setPage(pageParam);
        setPageSize(pageSizeParam);
        setTotalPages(1);
        setTotalItems(result.length);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games list");
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchGames(newPage, pageSize);
  };

  const changePageSize = (newSize: number) => {
    if (!newSize || newSize <= 0) return;
    setPageSize(newSize);
    fetchGames(1, newSize);
  };

  // ====== SEARCH / FILTER (gọi BE) ======
  const applyFilters = () => {
    // mỗi lần search/filter thì về trang 1
    fetchGames(1, pageSize);
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setTypeFilter("ALL");
    setActiveTab("all");
    fetchGames(1, pageSize);
  };

  // ====== DELETE & BULK ACTIONS ======

  const deleteGame = async (id: string) => {
    try {
      const res = (await callDeleteGame(
        id
      )) as unknown as IBackendRes<string>;
      if (res.error) {
        toast.error(String(res.error));
        return;
      }
      toast.success("Game moved to trash");
      fetchGames(1, pageSize);
      fetchStats();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === games.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(games.map((g) => g._id)));
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
    setActionTarget({ id: "", label: `${selectedIds.size} game${selectedIds.size > 1 ? "s" : ""}`, action });
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === "delete") {
        await callDeleteGame(actionTarget.id);
        toast.success("Game moved to trash");
      } else if (actionTarget.action === "restore") {
        await callRestoreGame(actionTarget.id);
        toast.success("Game restored");
      } else if (actionTarget.action === "bulkDelete") {
        await Promise.all([...selectedIds].map((id) => callDeleteGame(id)));
        toast.success(`${selectedIds.size} game(s) moved to trash`);
      } else if (actionTarget.action === "bulkRestore") {
        await Promise.all([...selectedIds].map((id) => callRestoreGame(id)));
        toast.success(`${selectedIds.size} game(s) restored`);
      }
      setSelectedIds(new Set());
      fetchGames(1, pageSize);
      fetchStats();
    } catch (error) {
      toast.error("An error occurred while processing the request");
    }
    setActionTarget(null);
  };

  return {
    // state
    games,
    loading,
    deleteId,

    // pagination
    page,
    pageSize,
    totalPages,
    totalItems,

    // search/filter
    searchKeyword,
    typeFilter,
    activeTab,
    selectedIds,
    actionTarget,
    stats,

    // setters / actions
    setDeleteId,
    deleteGame,
    changePage,
    changePageSize,

    // search/filter actions
    setSearchKeyword,
    setTypeFilter,
    setActiveTab,
    applyFilters,
    clearFilters,

    toggleSelectAll,
    toggleSelect,
    openConfirm,
    openBulkConfirm,
    handleConfirmAction,
    setActionTarget,
  };
};
