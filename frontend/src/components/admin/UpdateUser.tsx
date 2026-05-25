import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { callUpdateUser } from "@/config/api";
import { ChevronLeft, Save } from "lucide-react";

export interface UserItem {
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

interface UpdateUserProps {
  user: UserItem | null;
  mode: "edit" | "view";
  onBack: () => void;
}

const UpdateUser = ({ user, mode, onBack }: UpdateUserProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    address: "",
    role: "USER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        password: "",
        confirmPassword: "",
        name: user.name || "",
        address: user.address || "",
        role: user.role || "USER",
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!form.username) newErrors.username = "Username is required";
    if (form.password && form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const updateData: any = {};
      if (form.username !== user.username) updateData.username = form.username;
      if (form.name !== user.name) updateData.name = form.name;
      if (form.address !== user.address) updateData.address = form.address;
      if (form.role !== user.role) updateData.role = form.role;
      if (form.password) updateData.password = form.password;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes detected");
        setLoading(false);
        return;
      }

      await callUpdateUser(user._id, updateData);
      toast.success("User updated successfully");
      onBack(); // Return to users list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        User not found. <Button variant="link" onClick={onBack}>Go back</Button>
      </div>
    );
  }

  const isView = mode === "view";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isView ? "User Details" : "Edit User"}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {isView ? "View user information" : "Modify user account details"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription>Login credentials and role assignment.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  setErrors({ ...errors, username: "" });
                }}
                disabled={isView}
                placeholder="Enter username"
                className={`bg-gray-50 focus:bg-white ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>

            {!isView && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter new password"
                    className={`bg-gray-50 focus:bg-white ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      setErrors({ ...errors, confirmPassword: "" });
                    }}
                    placeholder="Confirm new password"
                    className={`bg-gray-50 focus:bg-white ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
                disabled={isView}
              >
                <SelectTrigger id="role" className="bg-gray-50 focus:bg-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base">Personal Profile</CardTitle>
            <CardDescription>Optional user details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isView}
                placeholder="Enter full name"
                className="bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={isView}
                placeholder="Enter address"
                className="bg-gray-50 focus:bg-white"
              />
            </div>
            
            {!isView && (
              <div className="pt-4 mt-8 flex items-center justify-end gap-3 border-t border-gray-100">
                <Button variant="outline" onClick={onBack} disabled={loading} className="px-6">
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={loading} className="px-6 gap-2">
                  {loading ? "Saving..." : "Update User"}
                  {!loading && <Save className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
          </CardContent>
        </Card>

        {isView && (
          <Card className="rounded-xl border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base">System Information</CardTitle>
              <CardDescription>Read-only technical details about this user record.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">User ID</p>
                  <p className="font-medium text-gray-900 font-mono bg-gray-50 p-2 rounded border border-gray-100">{user._id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{new Date(user.createdAt).toLocaleString()}</p>
                </div>
                {user.updatedAt && (
                  <div>
                    <p className="text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{new Date(user.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpdateUser;
