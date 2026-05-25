import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  User,
  Search,
  X,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import {
  callGetAllUsers,
  callCreateUser,
  callUpdateUser,
  callDeleteUser,
  callRestoreUser,
  callSearchUsers,
  callCountAllUsers,
  callCountActiveUsers,
  callCountDeletedUsers,
} from "@/config/api";

interface UserItem {
  _id: string;
  username: string;
  name: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deleted?: boolean;
}

interface UsersManagementProps {
  onCreateUser?: () => void;
  onEditUser?: (user: UserItem) => void;
  onViewUser?: (user: UserItem) => void;
}

const UsersManagement = ({ onCreateUser, onEditUser, onViewUser }: UsersManagementProps) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"all" | "active" | "deleted">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 });
  const [actionTarget, setActionTarget] = useState<{
    id: string;
    label: string;
    action: "delete" | "restore" | "bulkDelete" | "bulkRestore";
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
    if (isSearching && searchKeyword) {
      handleSearch(page);
    } else {
      fetchUsers(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, activeTab]);

  const getDeletedParam = (): boolean | null => {
    if (activeTab === "active") return false;
    if (activeTab === "deleted") return true;
    return null;
  };

  const extractPage = (res: any) => {
    const d = res?.data ?? res;
    if (d?.result && d?.meta) {
      return {
        content: d.result,
        totalPages: d.meta.pages ?? 1,
        totalElements: d.meta.total ?? 0,
        number: typeof d.meta.current === "number" ? Math.max(0, d.meta.current - 1) : 0,
      };
    }
    const payload = d?.data ?? d;
    const pageObj = payload?.content ? payload : d;
    return {
      content: pageObj?.content ?? pageObj?.data ?? [],
      totalPages: pageObj?.totalPages ?? pageObj?.pages ?? 1,
      totalElements: pageObj?.totalElements ?? pageObj?.total ?? 0,
      number: pageObj?.number ?? (pageObj?.current ? pageObj.current - 1 : 0),
    };
  };

  const fetchUsers = async (p?: number) => {
    try {
      setLoading(true);
      const usePage = typeof p === "number" ? p : page;
      const deleted = getDeletedParam();
      const res = await callGetAllUsers(usePage, size, undefined, deleted);
      const pageData = extractPage(res);
      setUsers(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      if (page !== pageData.number) {
        setPage(pageData.number);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [totalRes, activeRes, deletedRes] = await Promise.all([
        callCountAllUsers(),
        callCountActiveUsers(),
        callCountDeletedUsers(),
      ]);
      setStats({
        total: totalRes.data?.count ?? 0,
        active: activeRes.data?.count ?? 0,
        deleted: deletedRes.data?.count ?? 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (p = 0) => {
    if (!searchKeyword.trim()) {
      setIsSearching(false);
      setPage(0);
      fetchUsers(0);
      return;
    }
    setIsSearching(true);
    try {
      setLoading(true);
      const deleted = getDeletedParam();
      const payload = { keyword: searchKeyword.trim() };
      const res = await callSearchUsers(payload, p, size, undefined, deleted);
      const pageData = extractPage(res);
      setUsers(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setPage(pageData.number);
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
    setPage(0);
    fetchUsers(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(0);
    }
  };

  const validatePassword = (password: string, confirmPassword: string): boolean => {
    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const openConfirm = (id: string, label: string, action: "delete" | "restore") => {
    setActionTarget({ id, label, action });
    setConfirmOpen(true);
  };

  const openBulkConfirm = (action: "bulkDelete" | "bulkRestore") => {
    setActionTarget({ id: "", label: `${selectedIds.size} user${selectedIds.size > 1 ? "s" : ""}`, action });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    setConfirmOpen(false);

    if (actionTarget.action === "delete") {
      try {
        await callDeleteUser(actionTarget.id);
        toast.success("User moved to trash");
        fetchStats();
        refreshCurrentView();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to delete user");
      }
    } else if (actionTarget.action === "restore") {
      try {
        await callRestoreUser(actionTarget.id);
        toast.success("User restored");
        fetchStats();
        refreshCurrentView();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to restore user");
      }
    } else if (actionTarget.action === "bulkDelete") {
      try {
        await Promise.all([...selectedIds].map((id) => callDeleteUser(id)));
        toast.success(`${selectedIds.size} user(s) moved to trash`);
        setSelectedIds(new Set());
        fetchStats();
        refreshCurrentView();
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to delete some users");
      }
    } else if (actionTarget.action === "bulkRestore") {
      try {
        await Promise.all([...selectedIds].map((id) => callRestoreUser(id)));
        toast.success(`${selectedIds.size} user(s) restored`);
        setSelectedIds(new Set());
        fetchStats();
        refreshCurrentView();
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to restore some users");
      }
    }
    setActionTarget(null);
  };

  const refreshCurrentView = () => {
    if (isSearching && searchKeyword) {
      handleSearch(page);
    } else {
      fetchUsers(page);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u._id)));
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { className: string; icon: typeof Shield }> = {
      ADMIN: { className: "bg-primary/10 text-primary border-primary/20", icon: Shield },
      USER: { className: "bg-secondary/10 text-secondary border-secondary/20", icon: User },
      MODERATOR: { className: "bg-accent/10 text-accent border-accent/20", icon: Shield },
    };
    const config = roleConfig[role] || { className: "bg-muted text-muted-foreground border-border", icon: User };
    const IconComponent = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${config.className}`}>
        <IconComponent className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (deleted?: boolean) => {
    if (deleted) {
      return (
        <Badge variant="outline" className="gap-1 bg-rose-50 text-rose-600 border-rose-200">
          <Trash2 className="h-3 w-3" />
          Deleted
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-600 border-emerald-200">
        <Check className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const pageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (page <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages - 1);
      } else if (page >= totalPages - 3) {
        pages.push(0);
        pages.push("...");
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  const statCards = [
    { label: "Total Users", value: stats.total, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600", subtitle: "All registered users", subtitleColor: "text-blue-600" },
    { label: "Active Users", value: stats.active, icon: Check, iconBg: "bg-green-50", iconColor: "text-green-600", subtitle: "Currently active", subtitleColor: "text-green-600" },
    { label: "Deleted Users", value: stats.deleted, icon: Trash2, iconBg: "bg-red-50", iconColor: "text-red-500", subtitle: "Moved to trash", subtitleColor: "text-red-500" },
  ];

  if (loading && users.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-md">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const confirmTitle = () => {
    switch (actionTarget?.action) {
      case "delete": return "Move to Trash?";
      case "restore": return "Restore User?";
      case "bulkDelete": return "Move to Trash?";
      case "bulkRestore": return "Restore Users?";
      default: return "Confirm";
    }
  };

  const confirmMessage = () => {
    switch (actionTarget?.action) {
      case "delete": return `Are you sure you want to move "${actionTarget.label}" to trash?`;
      case "restore": return `Are you sure you want to restore "${actionTarget.label}"?`;
      case "bulkDelete": return `Are you sure you want to move ${actionTarget.label} to trash?`;
      case "bulkRestore": return `Are you sure you want to restore ${actionTarget.label}?`;
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className={`text-xs ${stat.subtitleColor} font-medium`}>{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100">
          {/* Row 1: Title */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-400 mt-0.5">Create, manage, and organize all users</p>
            </div>
          </div>

          {/* Row 2: Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["all", "active", "deleted"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(0); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by username or name..."
                  className="pl-9 pr-9 h-9 w-full sm:w-72 md:w-80 text-sm border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-all"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                {searchKeyword && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={handleResetSearch}
                  />
                )}
              </div>
              <Button
                onClick={onCreateUser}
                className="gap-2 h-9 w-full sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-4 px-5 py-3.5 rounded-xl bg-red-50 border border-red-100">
              <span className="text-base font-semibold text-red-600">
                {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <div className="ml-auto flex items-center gap-3">
                {activeTab !== "deleted" && (
                  <Button
                    onClick={() => openBulkConfirm("bulkDelete")}
                    variant="outline"
                    className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 h-10 px-5 font-medium"
                  >
                    <Trash2 className="h-5 w-5" /> Move to Trash
                  </Button>
                )}
                {activeTab !== "active" && (
                  <Button
                    onClick={() => openBulkConfirm("bulkRestore")}
                    variant="outline"
                    className="gap-2 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 h-10 px-5 font-medium"
                  >
                    <RotateCcw className="h-5 w-5" /> Restore
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                {activeTab !== "all" && (
                  <TableHead className="w-10 pl-6 h-12">
                    <Checkbox
                      checked={users.length > 0 && selectedIds.size === users.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Username</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Name</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Address</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Role</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Status</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 h-12">Created</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600 text-right pr-6 h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "all" ? 7 : 8} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-gray-300" />
                      <p className="text-sm">{isSearching ? `No users found matching "${searchKeyword}"` : "No users found"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user._id}
                    className={`border-b border-gray-100 transition-colors ${
                      user.deleted ? "bg-red-50/30" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {activeTab !== "all" && (
                      <TableCell className="pl-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(user._id)}
                          onCheckedChange={() => toggleSelect(user._id)}
                          aria-label={`Select ${user.username}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm text-gray-900">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700">{user.name}</TableCell>
                    <TableCell className="py-4 text-sm text-gray-500">{user.address || "—"}</TableCell>
                    <TableCell className="py-4">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="py-4">{getStatusBadge(user.deleted)}</TableCell>
                    <TableCell className="py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {!user.deleted && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => onViewUser && onViewUser(user)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => onEditUser && onEditUser(user)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => openConfirm(user._id, user.username, "delete")}
                              title="More"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {user.deleted && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              onClick={() => openConfirm(user._id, user.username, "restore")}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => openConfirm(user._id, user.username, "delete")}
                              title="More"
                            >
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

        {/* Pagination */}
        {users.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{users.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{totalElements}</span> users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={page === 0}
                className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {(p as number) + 1}
                  </button>
                )
              )}

              <button
                onClick={goNext}
                disabled={page + 1 >= totalPages}
                className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirmTitle()}
            </DialogTitle>
            <DialogDescription>{confirmMessage()}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setActionTarget(null); }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                actionTarget?.action === "restore" || actionTarget?.action === "bulkRestore"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-white"
              }
            >
              {actionTarget?.action === "restore" || actionTarget?.action === "bulkRestore" ? "Restore" : "Move to Trash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
