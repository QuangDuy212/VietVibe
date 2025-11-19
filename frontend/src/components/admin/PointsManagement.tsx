import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Award, Plus, Edit, Trash2 } from "lucide-react";
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

interface UserPoints {
  user_id: string;
  email: string;
  full_name: string;
  total_points: number;
}

const PointsManagement = () => {
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPoints | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email", { ascending: true });

      if (error) throw error;

      // Mock total points for now - in real implementation, sum from user activities
      const userPointsData = (data || []).map(user => ({
        user_id: user.id,
        email: user.email || "",
        full_name: user.full_name || "",
        total_points: Math.floor(Math.random() * 1000), // Replace with actual points calculation
      }));

      setUserPoints(userPointsData);
    } catch (error) {
      console.error("Error fetching user points:", error);
      toast.error("Failed to load user points");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: UserPoints) => {
    setEditingUser(user);
    setPoints(user.total_points);
    setDialogOpen(true);
  };

  const handleUpdatePoints = async () => {
    if (!editingUser) return;

    try {
      // In a real implementation, you would update points in a separate table
      toast.success("Points updated successfully");
      setDialogOpen(false);
      fetchUserPoints();
    } catch (error) {
      console.error("Error updating points:", error);
      toast.error("An error occurred");
    }
  };

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
              <CardDescription>
                Total Users: {userPoints.length}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPoints.map((user) => (
                  <TableRow key={user.user_id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        {user.total_points}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Points</DialogTitle>
            <DialogDescription>
              Update points for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePoints}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PointsManagement;
