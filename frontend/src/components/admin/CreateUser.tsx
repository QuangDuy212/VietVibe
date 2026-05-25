import { useState } from "react";
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
import { callCreateUser } from "@/config/api";
import { ChevronLeft, Save } from "lucide-react";

interface CreateUserProps {
  onBack: () => void;
}

const CreateUser = ({ onBack }: CreateUserProps) => {
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

  const handleCreate = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
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
      await callCreateUser(form);
      toast.success("User created successfully");
      onBack(); // Return to users list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
          <p className="text-sm text-gray-400 mt-0.5">Add a new user to the system</p>
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
                placeholder="Enter username"
                className={`bg-gray-50 focus:bg-white ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
                placeholder="Enter password"
                className={`bg-gray-50 focus:bg-white ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="Confirm password"
                className={`bg-gray-50 focus:bg-white ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
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
                placeholder="Enter address"
                className="bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="pt-4 mt-8 flex items-center justify-end gap-3 border-t border-gray-100">
              <Button variant="outline" onClick={onBack} disabled={loading} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading} className="px-6 gap-2">
                {loading ? "Creating..." : "Save User"}
                {!loading && <Save className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateUser;
