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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Edit, Trash2, UserPlus, Shield, User, Search, X } from "lucide-react";

// API functions
import {
  callGetAllUsers,
  callCreateUser,
  callUpdateUser,
  callDeleteUser,
  callSearchUsers,
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
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // search state
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // dialog states
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  
  const [form, setForm] = useState<{
    username: string;
    password: string;
    confirmPassword: string;
    name: string;
    address: string;
    role: string;
  }>({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    address: "",
    role: "USER",
  });

  const [passwordError, setPasswordError] = useState<string>("");

  // delete confirm states
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isSearching && searchKeyword) {
      handleSearch(page);
    } else {
      fetchUsers(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const extractPage = (res: any) => {
    const d = res?.data ?? res;

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
      if (typeof p === "number") {
        setPage(p);
      }
      const usePage = typeof p === "number" ? p : page;
      const res = await callGetAllUsers(usePage, size);
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

      if (!validatePassword(form.password, form.confirmPassword)) {
        return;
      }

      await callCreateUser({
        username: form.username,
        password: form.password,
        name: form.name,
        address: form.address,
        role: form.role,
      });
      
      toast.success("User created successfully");
      setCreateDialogOpen(false);
      // Refresh current view
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
      
      // Only update password if provided
      if (form.password) {
        if (!validatePassword(form.password, form.confirmPassword)) {
          return;
        }
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
      // Refresh current view
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

  const openDeleteConfirm = (user: UserItem) => {
    setDeleteTarget({
      id: user._id,
      label: `${user.username} - ${user.name}`,
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await callDeleteUser(id);
      toast.success("User deleted successfully");
      
      // Refresh current view
      if (isSearching && searchKeyword) {
        const isLastItemOnPage = users.length === 1 && page > 0;
        if (isLastItemOnPage) {
          setPage((prev) => Math.max(0, prev - 1));
        } else {
          handleSearch(page);
        }
      } else {
        const isLastItemOnPage = users.length === 1 && page > 0;
        if (isLastItemOnPage) {
          setPage((prev) => Math.max(0, prev - 1));
        } else {
          fetchUsers(page);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete user");
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
    if (!searchKeyword.trim()) {
      // If search keyword is empty, show all users
      setIsSearching(false);
      setPage(0);
      fetchUsers(0);
      return;
    }

    setIsSearching(true);
    try {
      setLoading(true);
      const payload = {
        keyword: searchKeyword.trim()
      };
      
      const res = await callSearchUsers(payload, p, size);
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Hàm highlight text tìm kiếm
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { variant: "default" as const, icon: Shield },
      USER: { variant: "secondary" as const, icon: User },
      MODERATOR: { variant: "outline" as const, icon: Shield },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { variant: "outline" as const, icon: User };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {role}
      </Badge>
    );
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Management
              </CardTitle>
              <CardDescription>
                {isSearching ? (
                  <>Found {totalElements} users matching "{searchKeyword}"</>
                ) : (
                  <>Total Users: {totalElements}</>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Box with Button */}
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or name..."
                    className="pl-10 pr-10 w-48 sm:w-64"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  {searchKeyword && (
                    <X 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={handleResetSearch}
                    />
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSearch(0)}
                  className="h-10 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                {isSearching && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSearch}
                    className="h-10"
                  >
                    Show All
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                onClick={openCreateDialog}
                className="flex items-center gap-2 h-10"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 h-12">
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Created Date</TableHead>
                  <TableHead className="text-center w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isSearching ? `No users found matching "${searchKeyword}"` : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      className="hover:bg-muted/30 h-14 border-b"
                    >
                      <TableCell className="text-center font-medium">
                        {user._id.substring(0, 8)}...
                      </TableCell>

                      <TableCell className="font-medium">
                        {isSearching ? highlightText(user.username, searchKeyword) : user.username}
                      </TableCell>

                      <TableCell>
                        {isSearching ? highlightText(user.name, searchKeyword) : user.name}
                      </TableCell>

                      <TableCell>{user.address || "-"}</TableCell>

                      <TableCell className="text-center">
                        {getRoleBadge(user.role)}
                      </TableCell>

                      <TableCell className="text-center">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            onClick={() => openDeleteConfirm(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                {isSearching ? (
                  <>Showing {users.length} of {totalElements} search results for "{searchKeyword}"</>
                ) : (
                  <>Showing {users.length} of {totalElements} users</>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="h-8 px-2"
                >
                  {"<<"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={goPrev}
                  disabled={page === 0}
                  className="h-8 px-2"
                >
                  {"<"}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i;
                    if (pageNum >= page - 2 && pageNum <= page + 2) {
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={pageNum === page ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum + 1}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={goNext}
                  disabled={page + 1 >= totalPages}
                  className="h-8 px-2"
                >
                  {">"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page + 1 >= totalPages}
                  className="h-8 px-2"
                >
                  {">>"}
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-username">Username *</Label>
              <Input
                id="create-username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
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
                  if (form.confirmPassword) {
                    validatePassword(e.target.value, form.confirmPassword);
                  }
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
              {passwordError && (
                <p className="text-sm text-destructive mt-1">{passwordError}</p>
              )}
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
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
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
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
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
          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <div className="p-2 border rounded bg-muted/50">
                {editing?._id}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
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
                  if (form.confirmPassword) {
                    validatePassword(e.target.value, form.confirmPassword);
                  }
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
              {passwordError && (
                <p className="text-sm text-destructive mt-1">{passwordError}</p>
              )}
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
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
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
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update User</Button>
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
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to delete user{" "}
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

export default UsersManagement;