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

import { Gamepad2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { IGame } from "@/types/common.type";
import { useGamesManagement } from "@/hooks/useGamesManagement";

type Game = IGame;

const GamesManagement = () => {
  const {
    games,
    loading,
    gameDialogOpen,
    dialogMode,
    currentGame,
    dialogLoading,
    saving,
    deleteId,

    page,
    pageSize,
    totalPages,
    totalItems,

    isCreateMode,
    isEditMode,
    canEdit,

    setGameDialogOpen,
    setDeleteId,
    openCreateGameDialog,
    openGameDialog,
    closeGameDialog,
    updateGameField,
    addQuestion,
    removeQuestion,
    updateQuestionField,
    addAnswer,
    removeAnswer,
    updateAnswerField,
    setCorrectAnswer,
    handleSaveGame,
    deleteGame,
    changePage,
    changePageSize,
  } = useGamesManagement();

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <>
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Games List
              </CardTitle>
              <CardDescription>Total: {totalItems} games</CardDescription>
            </div>
            <Button onClick={openCreateGameDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Game
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game._id} className="hover:bg-muted/30">
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
                          size="sm"
                          variant="outline"
                          onClick={() => openGameDialog(game, "view")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openGameDialog(game, "edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(game._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {games.length === 0 && (
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 px-1">
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
                  disabled={page <= 1}
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
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog create / view / edit */}
      <Dialog
        open={gameDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeGameDialog();
          else setGameDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode
                ? "Create New Game"
                : isEditMode
                ? "Edit Game & Questions"
                : "View Game Detail"}
            </DialogTitle>
            <DialogDescription>
              {currentGame
                ? renderTypeDescription(currentGame.type)
                : "Game detail"}
            </DialogDescription>
          </DialogHeader>

          {dialogLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : !currentGame ? (
            <div className="py-6 text-center text-muted-foreground">
              Game not found
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Game info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={currentGame.name}
                    disabled={!canEdit}
                    onChange={(e) => updateGameField("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  {isCreateMode ? (
                    <Select
                      value={currentGame.type}
                      onValueChange={(value) =>
                        updateGameField("type", value as Game["type"])
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose game type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE">
                          Multiple choice
                        </SelectItem>
                        <SelectItem value="SENTENCE_ORDER">
                          Sentence order
                        </SelectItem>
                        <SelectItem value="LISTENING_CHOICE">
                          Listening choice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2">
                      <Badge className={getTypeColor(currentGame.type)}>
                        {renderTypeLabel(currentGame.type)}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Game type cannot be changed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={currentGame.description}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateGameField("description", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Questions ({currentGame.questions?.length ?? 0})
                  </Label>
                  {canEdit && (
                    <Button size="sm" className="gap-2" onClick={addQuestion}>
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  )}
                </div>

                {(currentGame.questions ?? []).length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No questions yet.
                  </div>
                )}

                <div className="space-y-3">
                  {currentGame.questions?.map((q, qIndex) => (
                    <Card key={qIndex} className="border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle className="text-base">
                            Question #{qIndex + 1}
                          </CardTitle>
                        </div>
                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeQuestion(qIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Question Content</Label>
                          <Textarea
                            value={q.content}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateQuestionField(
                                qIndex,
                                "content",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </div>

                        {currentGame.type !== "LISTENING_CHOICE" && (
                          <div>
                            <Label>Image URL (optional)</Label>
                            <Input
                              value={q.imageUrl ?? ""}
                              disabled={!canEdit}
                              onChange={(e) =>
                                updateQuestionField(
                                  qIndex,
                                  "imageUrl",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}

                        {currentGame.type === "LISTENING_CHOICE" && (
                          <div>
                            <Label>Audio URL</Label>
                            <Input
                              value={q.audioUrl ?? ""}
                              disabled={!canEdit}
                              onChange={(e) =>
                                updateQuestionField(
                                  qIndex,
                                  "audioUrl",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}

                        {/* ANSWERS */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Answers</Label>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => addAnswer(qIndex)}
                              >
                                <Plus className="h-4 w-4" />
                                Add Answer
                              </Button>
                            )}
                          </div>

                          {(!q.answers || q.answers.length === 0) && (
                            <div className="text-xs text-muted-foreground">
                              No answers yet.
                            </div>
                          )}

                          <div className="space-y-2">
                            {q.answers?.map((a, aIndex) => (
                              <div
                                key={aIndex}
                                className={`flex flex-col gap-2 rounded-md border p-3 ${
                                  !canEdit && a.isCorrect
                                    ? "border-green-400/70 bg-green-50/40"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <Label className="text-xs">
                                    Answer #{aIndex + 1}
                                    {!canEdit && a.isCorrect && (
                                      <span className="ml-1 text-[10px] text-green-600 font-semibold">
                                        (correct)
                                      </span>
                                    )}
                                  </Label>
                                  {canEdit && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        removeAnswer(qIndex, aIndex)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>

                                <Input
                                  value={a.content}
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateAnswerField(
                                      qIndex,
                                      aIndex,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Answer content"
                                />

                                {currentGame.type === "SENTENCE_ORDER" ? (
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">
                                      Order Index
                                    </Label>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        disabled={!canEdit}
                                        className="h-8 w-8"
                                        onClick={() =>
                                          updateAnswerField(
                                            qIndex,
                                            aIndex,
                                            "orderIndex",
                                            Math.max(
                                              0,
                                              (a.orderIndex ?? 0) - 1
                                            )
                                          )
                                        }
                                      >
                                        -
                                      </Button>
                                      <Input
                                        type="number"
                                        className="w-20 h-8"
                                        disabled={!canEdit}
                                        value={a.orderIndex ?? 0}
                                        onChange={(e) =>
                                          updateAnswerField(
                                            qIndex,
                                            aIndex,
                                            "orderIndex",
                                            Number(e.target.value) || 0
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        disabled={!canEdit}
                                        className="h-8 w-8"
                                        onClick={() =>
                                          updateAnswerField(
                                            qIndex,
                                            aIndex,
                                            "orderIndex",
                                            (a.orderIndex ?? 0) + 1
                                          )
                                        }
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-2 text-xs">
                                    <input
                                      type="radio"
                                      name={`q-${qIndex}-correct`}
                                      disabled={!canEdit}
                                      checked={!!a.isCorrect}
                                      onChange={() =>
                                        setCorrectAnswer(qIndex, aIndex)
                                      }
                                    />
                                    {canEdit
                                      ? "Mark as correct answer"
                                      : a.isCorrect
                                      ? "Correct answer"
                                      : "Incorrect answer"}
                                  </label>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {canEdit &&
                  (currentGame.questions?.length ?? 0) > 0 && (
                    <div className="flex justify-end pt-2">
                      <Button size="sm" className="gap-2" onClick={addQuestion}>
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeGameDialog}>
              Close
            </Button>
            {canEdit && (
              <Button onClick={handleSaveGame} disabled={saving}>
                {saving
                  ? isCreateMode
                    ? "Creating..."
                    : "Saving..."
                  : isCreateMode
                  ? "Create"
                  : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this game? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteGame(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GamesManagement;
