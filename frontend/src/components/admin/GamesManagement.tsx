// src/components/admin/GamesManagement.tsx
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { Gamepad2, Plus, Edit, Trash2, Eye, Check, RotateCcw, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { IGame } from "@/types/common.type";
import { useGamesManagement } from "@/hooks/useGamesManagement";

type Game = IGame;

interface GamesManagementProps {
  onCreateGame: () => void;
  onEditGame: (game: Game) => void;
  onViewGame: (game: Game) => void;
}

const GamesManagement = ({ onCreateGame, onEditGame, onViewGame }: GamesManagementProps) => {
  const {
    games,
    loading,

    page,
    pageSize,
    totalPages,
    totalItems,

    // search/filter
    searchKeyword,
    typeFilter,

    changePage,
    changePageSize,

    // search/filter actions
    setSearchKeyword,
    setTypeFilter,
    setActiveTab,
    applyFilters,
    clearFilters,
    activeTab,
    selectedIds,
    actionTarget,
    stats,
    toggleSelectAll,
    toggleSelect,
    openConfirm,
    openBulkConfirm,
    handleConfirmAction,
  } = useGamesManagement();

  const confirmTitle = () => {
    switch (actionTarget?.action) {
      case "delete": return "Move to Trash?";
      case "restore": return "Restore Game?";
      case "bulkDelete": return "Move to Trash?";
      case "bulkRestore": return "Restore Games?";
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "SENTENCE_ORDER":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "LISTENING_CHOICE":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "Multiple choice";
      case "SENTENCE_ORDER":
        return "Sentence order";
      case "LISTENING_CHOICE":
        return "Listening choice";
      default:
        return type;
    }
  };

  const renderTypeDescription = (type: Game["type"]) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "Each question has multiple answers, choose exactly one correct answer.";
      case "SENTENCE_ORDER":
        return "Each question contains sentence parts. Players must arrange them in the correct order (by order index).";
      case "LISTENING_CHOICE":
        return "Each question has an audio URL and one correct choice answer.";
      default:
        return "";
    }
  };

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const statCards = [
    { label: "Total Games", value: stats.total, icon: Gamepad2, iconBg: "bg-blue-50", iconColor: "text-blue-600", subtitle: "All games", subtitleColor: "text-blue-600" },
    { label: "Active Games", value: stats.active, icon: Check, iconBg: "bg-green-50", iconColor: "text-green-600", subtitle: "Currently active", subtitleColor: "text-green-600" },
    { label: "Deleted Games", value: stats.deleted, icon: Trash2, iconBg: "bg-red-50", iconColor: "text-red-500", subtitle: "Moved to trash", subtitleColor: "text-red-500" },
  ];

  if (loading && games.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-md">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Game Management</h2>
              <p className="text-sm text-gray-400 mt-0.5">Create, manage, and organize all games</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["all", "active", "deleted"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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
                  placeholder="Search by name or description..."
                  className="pl-9 pr-9 h-9 w-full sm:w-72 md:w-80 text-sm border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-all"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                />
                {searchKeyword && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => {
                      setSearchKeyword("");
                      applyFilters();
                    }}
                  />
                )}
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "ALL" | Game["type"])
                }
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                  <SelectItem value="SENTENCE_ORDER">Sentence order</SelectItem>
                  <SelectItem value="LISTENING_CHOICE">Listening choice</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onCreateGame}
                className="gap-2 h-9 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Game
              </Button>
            </div>
          </div>

          {/* Bulk Actions Banner */}
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

        <div className="overflow-x-auto relative">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {activeTab !== "all" && (
                    <TableHead className="w-12 pl-6">
                      <Checkbox
                        checked={selectedIds.size === games.length && games.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game._id} className="hover:bg-muted/30">
                    {activeTab !== "all" && (
                      <TableCell className="pl-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(game._id)}
                          onCheckedChange={() => toggleSelect(game._id)}
                          aria-label={`Select ${game.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{game.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {game.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getTypeColor(String(game.type))}
                      >
                        {renderTypeLabel(String(game.type))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => onViewGame(game)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditGame(game)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {activeTab === "deleted" ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => openConfirm(game._id, game.name, "restore")}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openConfirm(game._id, game.name, "delete")}
                            title="Move to trash"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && games.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      No games found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {totalItems > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 px-1 pb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {startItem}-{endItem} of {totalItems}
                </span>
                <span className="hidden md:inline-block">•</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Rows per page</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) =>
                      changePageSize(Number(value) || 10)
                    }
                  >
                    <SelectTrigger className="h-8 w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => changePage(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* Confirm actions */}
      <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              {actionTarget?.action.includes("delete") ? (
                <Trash2 className="h-5 w-5 text-red-500" />
              ) : (
                <RotateCcw className="h-5 w-5 text-emerald-500" />
              )}
              {confirmTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              {confirmMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-xl ${
                actionTarget?.action.includes("delete")
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              onClick={handleConfirmAction}
            >
              {actionTarget?.action.includes("delete") ? "Move to Trash" : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GamesManagement;
