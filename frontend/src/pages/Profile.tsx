import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    address: "",
    password: "",
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
          console.error("Lỗi khi tải thông số profile:", error);
        }
      }
    };
    fetchProfileStats();
  }, [user?._id]);

  // --- Logic Xử lý Sửa Profile (Giữ nguyên) ---
  const handleOpenEdit = () => {
    setEditData({
      name: user.name || "",
      address: user.address || "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editData.name) {
      alert("Họ tên không được để trống!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: editData.name,
        address: editData.address,
      };
      if (editData.password) payload.password = editData.password;

      const res = await callUpdateUser(user._id, payload);

      if (res.data) {
        alert("Cập nhật thành công!");
        dispatch(setUserLoginInfo(res.data as any));
        setIsEditModalOpen(false);
      }
    } catch (error) {
      alert("Cập nhật thất bại. Vui lòng thử lại.");
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
        <Card className="mb-8 border-none shadow-sm bg-card/50 backdrop-blur text-black">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-black">
                    {user.name}
                  </h1>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-none">
                    Premium
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> {user.username}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {user.address || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Joined Aug 2025
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="rounded-full shadow-sm hover:bg-primary hover:text-white transition-all border-primary/40 text-primary font-medium"
                >
                  <Edit className="h-3.5 w-3.5 mr-2" /> Edit Profile
                </Button>
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
          <Card className="border-none shadow-sm text-black">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6">
              {[
                { label: "Full Name", value: user.name },
                { label: "Username", value: user.username },
                { label: "Location", value: user.address || "Chưa cập nhật" },
                { label: "Native Language", value: "Vietnamese" },
              ].map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm text-black">
            <CardHeader>
              <CardTitle className="text-lg">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { id: "beginner", label: "Beginner" },
                  { id: "intermediate", label: "Intermediate" },
                  { id: "advanced", label: "Advanced" },
                ].map((lv) => {
                  // Xác định rõ key này thuộc về lessonStats
                  const key = lv.id as keyof typeof lessonStats;
                  const data = lessonStats[key];

                  return (
                    <div
                      key={lv.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{lv.label} Lessons</span>
                      <Badge variant="secondary" className="font-mono">
                        {data.completed}/{data.total} Completed
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODAL EDIT PROFILE --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6 text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              Edit Personal Info
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
                Username không thể thay đổi
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
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2 text-black">
                <Lock className="h-4 w-4" /> New Password
              </label>
              <input
                type="password"
                placeholder="Để trống nếu không đổi"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 ring-primary/20 outline-none"
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
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
              Hủy
            </Button>
            <Button
              className="flex-1 rounded-xl bg-primary text-white font-bold"
              onClick={handleUpdateProfile}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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
                  <Gamepad2 className="h-6 w-6" /> Lịch sử chơi game
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Theo dõi hành trình cải thiện điểm số của bạn
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên game..."
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
                        <th className="p-4 text-left">Tên Game</th>
                        <th className="p-4 text-center">Tổng Điểm</th>
                        <th className="p-4 text-center">Thời Gian</th>
                        <th className="p-4 text-right">Hành Động</th>
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
                                  Đúng {item.correctAnswers}/
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
                              Chơi lại
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
                      Hiển thị trang {currentPage} / {totalPages}
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
                <h3 className="font-bold text-lg">Không tìm thấy kết quả</h3>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
