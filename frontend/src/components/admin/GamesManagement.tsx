// src/components/admin/GamesManagement.tsx
import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { 
  Gamepad2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Check, 
  RotateCcw, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle 
} from "lucide-react";
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
    setActionTarget,
  } = useGamesManagement();

  // Dynamic filter application as the user types or filters
  useEffect(() => {
    applyFilters();
  }, [searchKeyword, typeFilter]);

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

  if (loading && games.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-md rounded-xl">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5 animate-spin text-gray-400" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Games</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-primary mt-2 font-medium">All registered games</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Games</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.active}</h3>
                <p className="text-sm text-green-600 mt-2 font-medium">Currently active</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Deleted Games</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.deleted}</h3>
                <p className="text-sm text-red-500 mt-2 font-medium">Moved to trash</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TABLE CARD */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Game Management</CardTitle>
              <CardDescription className="text-gray-500 mt-1">Create, manage, and organize all games</CardDescription>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
            {/* Elegant Brand Coral Capsule Tabs */}
            <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-full border border-gray-100">
              {(["all", "active", "deleted"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 capitalize ${
                    activeTab === tab
                      ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/20"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Modern Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9 pr-9 h-10 w-full sm:w-64 bg-gray-50/50 border-gray-200 rounded-xl"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                {searchKeyword && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => setSearchKeyword("")}
                  />
                )}
              </div>

              {/* Game Type Select Filter */}
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "ALL" | Game["type"])
                }
              >
                <SelectTrigger className="w-[180px] h-10 rounded-xl border-gray-200 bg-gray-50/50">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                  <SelectItem value="SENTENCE_ORDER">Sentence order</SelectItem>
                  <SelectItem value="LISTENING_CHOICE">Listening choice</SelectItem>
                </SelectContent>
              </Select>

              {/* Brand Coral Add Button */}
              <Button
                onClick={onCreateGame}
                className="gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shrink-0 h-10 px-5 font-semibold transition-all duration-200"
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
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto relative rounded-xl border border-gray-100 mx-6 mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  {activeTab !== "all" && (
                    <TableHead className="w-12 pl-6">
                      <Checkbox
                        checked={selectedIds.size === games.length && games.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead className="py-3.5">Name</TableHead>
                  <TableHead className="py-3.5">Description</TableHead>
                  <TableHead className="py-3.5">Type</TableHead>
                  <TableHead className="text-right pr-6 py-3.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game._id} className="hover:bg-gray-50/50 transition-colors">
                    {activeTab !== "all" && (
                      <TableCell className="pl-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(game._id)}
                          onCheckedChange={() => toggleSelect(game._id)}
                          aria-label={`Select ${game.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium py-4">{game.name}</TableCell>
                    <TableCell className="max-w-xs truncate py-4 text-gray-500">
                      {game.description}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-md font-semibold ${getTypeColor(String(game.type))}`}
                      >
                        {renderTypeLabel(String(game.type))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => onViewGame(game)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditGame(game)}
                          title="Edit"
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
                      colSpan={activeTab !== "all" ? 5 : 4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No games found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* SLEEK PAGINATION CONTROLS */}
          {games.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{games.length}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalItems}</span> games
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1 || loading}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-xs text-gray-400">...</span>}
                      <button
                        onClick={() => changePage(p)}
                        disabled={loading}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                          page === p
                            ? "bg-[#ff6b6b] text-white shadow-md transform scale-105"
                            : "bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="h-9 w-9 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm actions */}
      <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              {actionTarget?.action.includes("delete") ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
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
              className={`rounded-xl text-white ${
                actionTarget?.action.includes("delete")
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
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
