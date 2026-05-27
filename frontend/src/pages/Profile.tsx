import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatsCard from "@/components/StatsCard";
import { toast } from "sonner";
import {
  Trophy,
  BookOpen,
  Gamepad2,
  Flame,
  Edit,
  Mail,
  MapPin,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  User,
  Languages,
} from "lucide-react";
import Header from "@/components/Header";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { useEffect, useState } from "react";
import {
  callGetTotalScore,
  callGetMyHistory,
  callFetchLessonsPaginated,
  callUpdateUser,
} from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";

const Profile = () => {
  const user = useAppSelector((state) => state.account.user);
  const [lessonStats, setLessonStats] = useState<{
    beginner: { completed: number; total: number };
    intermediate: { completed: number; total: number };
    advanced: { completed: number; total: number };
  }>({
    beginner: { completed: 0, total: 0 },
    intermediate: { completed: 0, total: 0 },
    advanced: { completed: 0, total: 0 },
  });

  // Tạo thêm 1 state riêng cho tổng số bài hoàn thành để tránh lỗi
  const [overallCompleted, setOverallCompleted] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- States cũ của bạn (Giữ nguyên 100%) ---
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- States cho chức năng Sửa ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfileStats = async () => {
      if (user?._id) {
        try {
          const resTotal = await callGetTotalScore(user._id);
          if (resTotal?.data) setTotalPoints(resTotal.data as any);

          const resHistory = await callGetMyHistory();
          if (resHistory?.data) setHistory(resHistory.data as any);

          const resLessons = await callFetchLessonsPaginated(1, 100);
          if (resLessons?.data?.result) {
            const allLessons = resLessons.data.result as any[];

            const stats = {
              beginner: { completed: 0, total: 0 },
              intermediate: { completed: 0, total: 0 },
              advanced: { completed: 0, total: 0 },
              overallCompleted: 0,
            };

            allLessons.forEach((l) => {
              // 1. Lấy level từ API (Backend trả về enum: BEGINNER, INTERMEDIATE, ADVANCE)
              // Nếu trường dữ liệu tên khác (ví dụ l.lessonlevel), bạn hãy đổi tên lại cho đúng
              const levelFromApi = l.level;

              let category: "beginner" | "intermediate" | "advanced" =
                "beginner";

              // 2. So sánh khớp với Enum của Backend
              if (levelFromApi === "INTERMEDIATE") {
                category = "intermediate";
              } else if (
                levelFromApi === "ADVANCE" ||
                levelFromApi === "ADVANCED"
              ) {
                category = "advanced";
              } else {
                category = "beginner";
              }

              // 3. Cộng dồn vào stats
              stats[category].total += 1;
              if (l.progress === 100 || l.completed === true) {
                stats[category].completed += 1;
                stats.overallCompleted += 1;
              }
            });

            setLessonStats({
              beginner: stats.beginner,
              intermediate: stats.intermediate,
              advanced: stats.advanced,
            });
            setOverallCompleted(stats.overallCompleted);
          }
        } catch (error) {
          console.error("Error loading profile stats:", error);
        }
      }
    };
    fetchProfileStats();
  }, [user?._id]);

  // --- Logic Xử lý Sửa Profile & Đổi mật khẩu ---
  const handleOpenEdit = () => {
    setEditData({
      name: user.name || "",
      address: user.address || "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenChangePassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editData.name.trim()) {
      toast.error("Full name cannot be empty!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: editData.name,
        address: editData.address,
      };

      const res = await callUpdateUser(user._id, payload);

      if (res.data) {
        toast.success("Profile updated successfully!");
        dispatch(setUserLoginInfo(res.data as any));
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Please enter your current password!");
      return;
    }
    if (!passwordData.newPassword.trim()) {
      toast.error("Please enter your new password!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Confirm password does not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      };

      const res = await callUpdateUser(user._id, payload);

      if (res.data) {
        toast.success("Password changed successfully!");
        setIsPasswordModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Current password is incorrect!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Logic Lịch sử (Giữ nguyên) ---
  const filteredHistory = history.filter((item) =>
    item.gameName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background text-black">
      <Header />

      <div className="container px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 border border-primary/10 shadow-md bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl relative overflow-hidden text-black">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -ml-16 -mb-16 w-48 h-48 rounded-full bg-gradient-to-br from-secondary/5 to-transparent blur-3xl opacity-50 pointer-events-none" />

          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <Avatar className="h-28 w-28 border-4 border-white dark:border-background shadow-2xl rounded-full flex-shrink-0">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  <Badge className="bg-gradient-to-r from-primary via-accent to-secondary text-white border-none font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 shadow-sm">
                    Premium
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                    <Mail className="h-4.5 w-4.5 text-primary/70" /> {user.username}
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-secondary transition-colors cursor-default">
                    <MapPin className="h-4.5 w-4.5 text-secondary/70" /> {user.address || "Not updated"}
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-accent transition-colors cursor-default">
                    <Calendar className="h-4.5 w-4.5 text-accent/70" /> Joined Aug 2025
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEdit}
                    className="rounded-xl border border-primary/20 bg-background/50 hover:bg-primary hover:text-white transition-all text-primary font-bold shadow-sm active:scale-95 duration-200"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit Information
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenChangePassword}
                    className="rounded-xl border border-secondary/20 bg-background/50 hover:bg-secondary hover:text-white transition-all text-secondary font-bold shadow-sm active:scale-95 duration-200"
                  >
                    <Lock className="h-3.5 w-3.5 mr-2" /> Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Trophy}
            label="Total Points"
            value={totalPoints}
            color="primary"
          />
          <StatsCard
            icon={BookOpen}
            label="Lessons Completed"
            value={overallCompleted} // Dùng biến state riêng này
            color="secondary"
          />
          <div
            onClick={() => setIsHistoryOpen(true)}
            className="cursor-pointer transition-all hover:scale-[1.03] active:scale-95"
          >
            <StatsCard
              icon={Gamepad2}
              label="Games Played"
              value={history.length}
              color="accent"
            />
          </div>
          <StatsCard
            icon={Flame}
            label="Day Streak"
            value="7 days"
            color="primary"
          />
        </div>

        {/* Basic Info & Progress */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border border-primary/10 shadow-sm text-black hover:border-primary/15 transition-all">
            <CardHeader className="border-b border-primary/5 pb-4">
              <CardTitle className="text-xl font-bold tracking-tight">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
              {[
                { label: "Full Name", value: user.name, icon: User, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { label: "Username", value: user.username, icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Location", value: user.address || "Not updated", icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Native Language", value: "Vietnamese", icon: Languages, color: "text-blue-500", bg: "bg-blue-500/10" },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-muted/30 transition-all hover:bg-muted/30">
                    <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${item.bg} ${item.color} shadow-sm flex-shrink-0`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      <p className="font-extrabold text-foreground text-sm truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border border-primary/10 shadow-sm text-black hover:border-primary/15 transition-all">
            <CardHeader className="border-b border-primary/5 pb-4">
              <CardTitle className="text-xl font-bold tracking-tight">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {[
                { id: "beginner", label: "Beginner Lessons", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10", progressColor: "from-emerald-500 to-green-400" },
                { id: "intermediate", label: "Intermediate Lessons", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", progressColor: "from-blue-500 to-indigo-400" },
                { id: "advanced", label: "Advanced Lessons", icon: BookOpen, color: "text-primary", bg: "bg-primary/10", progressColor: "from-primary to-accent" },
              ].map((lv) => {
                const key = lv.id as keyof typeof lessonStats;
                const data = lessonStats[key];
                const total = data.total || 0;
                const completed = data.completed || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                const IconComponent = lv.icon;

                return (
                  <div key={lv.id} className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${lv.bg} ${lv.color}`}>
                          <IconComponent className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{lv.label}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">
                        {completed}/{total} Completed ({percent}%)
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={percent} 
                        className="h-2.5 bg-red-100 dark:bg-red-950/40 border border-red-200/20 dark:border-red-900/10 overflow-hidden" 
                        indicatorClassName={`bg-gradient-to-r ${lv.progressColor} rounded-full transition-all duration-500 ease-out`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODAL EDIT PROFILE --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6 text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2">
              <User className="h-6 w-6 text-primary" /> Edit Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" /> Username
              </label>
              <input
                className="w-full px-3 py-2 border rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
                value={user.username}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground italic">
                Username cannot be changed
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <User className="h-4 w-4" /> Full Name
              </label>
              <input
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-primary/20 outline-none"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <MapPin className="h-4 w-4" /> Address
              </label>
              <input
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-primary/20 outline-none"
                value={editData.address}
                onChange={(e) =>
                  setEditData({ ...editData, address: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-primary text-white font-bold"
              onClick={handleUpdateProfile}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL ĐỔI MẬT KHẨU --- */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6 text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-primary" /> Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <Lock className="h-4 w-4" /> Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-primary/20 outline-none"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <Lock className="h-4 w-4 text-emerald-500" /> New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-emerald-500/20 outline-none"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <Lock className="h-4 w-4 text-emerald-500" /> Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-emerald-500/20 outline-none"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-primary text-white font-bold"
              onClick={handleChangePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL LỊCH SỬ --- */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl text-black">
          <DialogHeader className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                  <Gamepad2 className="h-6 w-6" /> Game History
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Track your score improvement history
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search game name..."
                  className="pl-10 pr-4 py-2 bg-muted/50 border-none rounded-full text-sm w-full md:w-64 focus:ring-2 ring-primary/20 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            {filteredHistory.length > 0 ? (
              <>
                <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-muted-foreground text-[11px] font-bold uppercase tracking-widest">
                        <th className="p-4 text-left">Game Name</th>
                        <th className="p-4 text-center">Total Score</th>
                        <th className="p-4 text-center">Time</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {currentItems.map((item, idx) => (
                        <tr
                          key={item._id || idx}
                          className="hover:bg-primary/[0.02] transition-colors group"
                        >
                          <td className="p-4 text-black">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Trophy className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold flex items-center gap-2 capitalize">
                                  {item.gameName}
                                  {item.bonus > 0 && (
                                    <Badge className="h-4 px-1 text-[9px] bg-yellow-500 shadow-none border-none">
                                      BEST
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-[10px] text-muted-foreground italic">
                                  Correct {item.correctAnswers}/
                                  {item.totalQuestions}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-base font-black text-primary">
                              {item.score + item.bonus}
                            </span>
                          </td>
                          <td className="p-4 text-center text-muted-foreground text-xs font-medium">
                            <div className="flex flex-col">
                              <span>
                                {new Date(item.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                              <span className="text-[10px] opacity-60">
                                {new Date(item.createdAt).toLocaleTimeString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/game/${item.gameId}`)}
                              className="rounded-full text-xs font-bold hover:bg-primary hover:text-white"
                            >
                              Play Again
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-[11px] text-muted-foreground font-medium italic">
                      Showing page {currentPage} / {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg">No results found</h3>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
