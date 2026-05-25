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

const UsersManagement = () => {
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

  const [editing, setEditing] = useState<UserItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    address: "",
    role: "USER",
  });
  const [passwordError, setPasswordError] = useState("");

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
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const openCreateDialog = () => {
    setForm({
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      address: "",
      role: "USER",
    });
    setPasswordError("");
    setCreateDialogOpen(true);
  };

  const openEditDialog = (user: UserItem) => {
    setEditing(user);
    setForm({
      username: user.username,
      password: "",
      confirmPassword: "",
      name: user.name,
      address: user.address,
      role: user.role,
    });
    setPasswordError("");
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      if (!form.username || !form.password || !form.name) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!validatePassword(form.password, form.confirmPassword)) return;
      await callCreateUser({
        username: form.username,
        password: form.password,
        name: form.name,
        address: form.address,
        role: form.role,
      });
      toast.success("User created successfully");
      setCreateDialogOpen(false);
      fetchStats();
      if (isSearching && searchKeyword) {
        handleSearch(0);
      } else {
        fetchUsers(0);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create user");
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const updateData: any = {};
      if (form.username !== editing.username) updateData.username = form.username;
      if (form.name !== editing.name) updateData.name = form.name;
      if (form.address !== editing.address) updateData.address = form.address;
      if (form.role !== editing.role) updateData.role = form.role;
      if (form.password) {
        if (!validatePassword(form.password, form.confirmPassword)) return;
        updateData.password = form.password;
      }
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes detected");
        return;
      }
      await callUpdateUser(editing._id, updateData);
      toast.success("User updated successfully");
      setDialogOpen(false);
      setEditing(null);
      if (isSearching && searchKeyword) {
        handleSearch(page);
      } else {
        fetchUsers(page);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update user");
    }
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
    { label: "Total Users", value: stats.total, icon: Users, bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    { label: "Active Users", value: stats.active, icon: Check, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    { label: "Deleted Users", value: stats.deleted, icon: Trash2, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
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
    <div className="space-y-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-white border-gray-200 shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bg} border ${stat.border}`}>
                    <Icon className={`h-5 w-5 ${stat.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs + Search + Actions */}
      <Card className="bg-white border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setPage(0); }} className="w-auto">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                <TabsTrigger value="active" className="text-sm">Active</TabsTrigger>
                <TabsTrigger value="deleted" className="text-sm">Deleted</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or name..."
                    className="pl-9 pr-9 h-9 w-52 sm:w-64 text-sm"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  {searchKeyword && (
                    <X
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={handleResetSearch}
                    />
                  )}
                </div>
                <Button size="sm" onClick={() => handleSearch(0)} className="h-9 gap-1.5 text-sm">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                {isSearching && (
                  <Button variant="outline" size="sm" onClick={handleResetSearch} className="h-9 text-sm">
                    Show All
                  </Button>
                )}
              </div>

              <Button size="sm" onClick={openCreateDialog} className="h-9 gap-1.5 text-sm">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/40 border border-dashed">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="ml-auto flex items-center gap-2">
                {activeTab !== "deleted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-sm text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => openBulkConfirm("bulkDelete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Move to Trash
                  </Button>
                )}
                {activeTab !== "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => openBulkConfirm("bulkRestore")}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 h-11 border-b border-gray-200">
                  <TableHead className="w-10 px-3">
                    <Checkbox
                      checked={users.length > 0 && selectedIds.size === users.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Address</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Created</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
                        <p>{isSearching ? `No users found matching "${searchKeyword}"` : "No users found"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      className={`h-12 border-b border-gray-100 ${user.deleted ? "bg-rose-50/30" : "hover:bg-slate-50/60"}`}
                    >
                      <TableCell className="px-3 py-2">
                        <Checkbox
                          checked={selectedIds.has(user._id)}
                          onCheckedChange={() => toggleSelect(user._id)}
                          aria-label={`Select ${user.username}`}
                        />
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono text-slate-500">
                        {user._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="py-2 font-medium text-sm">{user.username}</TableCell>
                      <TableCell className="py-2 text-sm">{user.name}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{user.address || "-"}</TableCell>
                      <TableCell className="py-2 text-center">{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="py-2 text-center">{getStatusBadge(user.deleted)}</TableCell>
                      <TableCell className="py-2 text-center text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!user.deleted && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => openConfirm(user._id, user.username, "delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {user.deleted && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
                                onClick={() => openConfirm(user._id, user.username, "restore")}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => openConfirm(user._id, user.username, "delete")}
                              >
                                <Trash2 className="h-4 w-4" />
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-slate-50/50">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-medium">{users.length}</span> of{" "}
                <span className="font-medium">{totalElements}</span> users
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goPrev}
                  disabled={page === 0}
                  className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {pageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === page ? "default" : "ghost"}
                        onClick={() => setPage(p as number)}
                        className={`h-8 w-8 rounded-lg text-xs font-medium ${
                          p === page
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                        }`}
                      >
                        {(p as number) + 1}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goNext}
                  disabled={page + 1 >= totalPages}
                  className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="create-username">Username *</Label>
              <Input
                id="create-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="create-password">Password *</Label>
              <Input
                id="create-password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (form.confirmPassword) validatePassword(e.target.value, form.confirmPassword);
                }}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div>
              <Label htmlFor="create-confirm-password">Confirm Password *</Label>
              <Input
                id="create-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  validatePassword(form.password, e.target.value);
                }}
                placeholder="Confirm password"
              />
              {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
            </div>
            <div>
              <Label htmlFor="create-name">Full Name *</Label>
              <Input
                id="create-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="create-address">Address</Label>
              <Input
                id="create-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor="create-role">Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>User ID</Label>
              <div className="p-2 border rounded bg-muted/50 text-xs font-mono">{editing?._id}</div>
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (form.confirmPassword) validatePassword(e.target.value, form.confirmPassword);
                }}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="edit-confirm-password">Confirm New Password</Label>
              <Input
                id="edit-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  validatePassword(form.password, e.target.value);
                }}
                placeholder="Confirm new password"
              />
              {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
            </div>
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
