// src/hooks/useGamesManagement.ts
import { useEffect, useState } from "react";
import {
  callGetGames,
  callCreateGame,
  callUpdateGame,
  callDeleteGame,
  callGetGameDetail,
} from "@/config/api";
import {
  IBackendRes,
  IGame,
  IPaginationRes,
  IQuestion,
  IAnswer,
} from "@/types/common.type";
import { toast } from "sonner";

export type GameDialogMode = "view" | "create" | "edit";

export const useGamesManagement = () => {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);

  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<GameDialogMode>("view");
  const [currentGame, setCurrentGame] = useState<IGame | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // search & filter (đẩy xuống BE dùng spring-filter)
  type GameType = IGame["type"];
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | GameType>("ALL");

  useEffect(() => {
    fetchGames(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== SEARCH & FILTER: build expression cho BE (spring-filter) ======
  const buildFilterExpression = () => {
    const parts: string[] = [];
    const keyword = searchKeyword.trim();

    if (keyword) {
      // escape dấu nháy đơn trong keyword để không vỡ string
      const escaped = keyword.replace(/'/g, "\\'");
      // spring-filter: ~ = like, dùng '%' trong string, và dùng NHÁY ĐƠN
      parts.push(`(name ~ '%${escaped}%' or description ~ '%${escaped}%')`);
    }

    if (typeFilter !== "ALL") {
      // enum GameType: MULTIPLE_CHOICE / SENTENCE_ORDER / LISTENING_CHOICE
      parts.push(`type : '${typeFilter}'`);
    }

    // nếu có cả search + type → nối bằng and
    return parts.join(" and ");
  };

  // ====== FETCH LIST (BE filter + BE pagination) ======
  const fetchGames = async (
    pageParam: number = page,
    pageSizeParam: number = pageSize
  ) => {
    try {
      setLoading(true);

      const filterExpr = buildFilterExpression();

      const res = (await callGetGames(
        pageParam,
        pageSizeParam,
        filterExpr || undefined
      )) as unknown as IBackendRes<IPaginationRes<IGame>>;

      const pagination = res.data;
      const result = pagination?.result ?? [];
      setGames(result);

      const meta = pagination?.meta;
      if (meta) {
        setPage(typeof meta.current === "number" ? meta.current : pageParam);
        setPageSize(
          typeof meta.pageSize === "number" ? meta.pageSize : pageSizeParam
        );
        setTotalPages(meta.pages ?? 1);
        setTotalItems(meta.total ?? result.length);
      } else {
        setPage(pageParam);
        setPageSize(pageSizeParam);
        setTotalPages(1);
        setTotalItems(result.length);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games list");
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchGames(newPage, pageSize);
  };

  const changePageSize = (newSize: number) => {
    if (!newSize || newSize <= 0) return;
    setPageSize(newSize);
    fetchGames(1, newSize);
  };

  // ====== SEARCH / FILTER (gọi BE) ======
  const applyFilters = () => {
    // mỗi lần search/filter thì về trang 1
    fetchGames(1, pageSize);
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setTypeFilter("ALL");
    fetchGames(1, pageSize);
  };

  // ====== OPEN DIALOG: CREATE / VIEW / EDIT ======

  const openCreateGameDialog = () => {
    setDialogMode("create");
    setCurrentGame({
      _id: "",
      name: "",
      description: "",
      type: "MULTIPLE_CHOICE",
      questions: [],
    });
    setGameDialogOpen(true);
  };

  const openGameDialog = async (game: IGame, mode: GameDialogMode) => {
    try {
      setDialogMode(mode);
      setGameDialogOpen(true);
      setDialogLoading(true);

      const res = (await callGetGameDetail(
        game._id
      )) as unknown as IBackendRes<IGame>;
      console.log("GAME DETAIL RAW >>>", res);

      if (res.data) {
        const raw = res.data as any;

        const rawQuestions =
          raw.questions ?? raw.questionList ?? raw.gameQuestions ?? [];

        const questions: IQuestion[] = Array.isArray(rawQuestions)
          ? rawQuestions.map((q: any): IQuestion => {
              const rawAnswers =
                q.answers ?? q.answerList ?? q.answerDTOs ?? [];

              const answers: IAnswer[] = Array.isArray(rawAnswers)
                ? rawAnswers.map((a: any): IAnswer => {
                    const content =
                      a.content ?? a.text ?? a.answerContent ?? "";

                    const boolIsCorrect = !!a.isCorrect;

                    let orderIndex: number | undefined = undefined;
                    if (typeof a.orderIndex === "number")
                      orderIndex = a.orderIndex;
                    else if (typeof a.order === "number") orderIndex = a.order;
                    else if (typeof a.index === "number") orderIndex = a.index;
                    else if (a.orderIndex != null)
                      orderIndex = Number(a.orderIndex);
                    else if (a.order != null) orderIndex = Number(a.order);
                    else if (a.index != null) orderIndex = Number(a.index);

                    return {
                      _id: a._id,
                      content,
                      isCorrect: boolIsCorrect,
                      orderIndex,
                    };
                  })
                : [];

              return {
                _id: q._id,
                content: q.content ?? q.text ?? "",
                imageUrl: q.imageUrl,
                audioUrl: q.audioUrl,
                answers,
              };
            })
          : [];

        const mappedGame: IGame = {
          _id: raw._id,
          name: raw.name,
          description: raw.description,
          type: raw.type,
          questions,
        };

        setCurrentGame(mappedGame);
      } else {
        toast.error("Game not found");
        setCurrentGame(null);
      }
    } catch (error) {
      console.error("Error loading game detail:", error);
      toast.error("Failed to load game detail");
      setCurrentGame(null);
    } finally {
      setDialogLoading(false);
    }
  };

  const closeGameDialog = () => {
    setGameDialogOpen(false);
    setCurrentGame(null);
    setDialogMode("view");
  };

  // ====== FLAGS ======

  const isViewMode = dialogMode === "view";
  const isCreateMode = dialogMode === "create";
  const isEditMode = dialogMode === "edit";
  const canEdit = isCreateMode || isEditMode;

  // ====== UPDATE GAME FIELD ======
  const updateGameField = (field: keyof IGame, value: any) => {
    if (!canEdit) return;
    setCurrentGame((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // ====== QUESTIONS / ANSWERS ======

  const addQuestion = () => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];

      let defaultAnswers: IAnswer[] = [];

      if (prev.type === "MULTIPLE_CHOICE" || prev.type === "LISTENING_CHOICE") {
        defaultAnswers = [0, 1, 2, 3].map((index) => ({
          content: "",
          isCorrect: index === 0,
        }));
      } else if (prev.type === "SENTENCE_ORDER") {
        defaultAnswers = [
          {
            content: "",
            orderIndex: 0,
          },
        ];
      }

      const newQuestion: IQuestion = {
        content: "",
        imageUrl: undefined,
        audioUrl: undefined,
        answers: defaultAnswers,
      };

      questions.push(newQuestion);
      return { ...prev, questions };
    });
  };

  const removeQuestion = (qIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      questions.splice(qIndex, 1);
      return { ...prev, questions };
    });
  };

  const updateQuestionField = (
    qIndex: number,
    field: keyof IQuestion,
    value: any
  ) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex], [field]: value };
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const addAnswer = (qIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      const base: IAnswer = { content: "" };

      if (prev.type === "SENTENCE_ORDER") {
        base.orderIndex = 0;
      } else {
        base.isCorrect = false;
      }

      answers.push(base);
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      answers.splice(aIndex, 1);
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const updateAnswerField = (
    qIndex: number,
    aIndex: number,
    field: keyof IAnswer,
    value: any
  ) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];
      const a = { ...answers[aIndex], [field]: value };
      answers[aIndex] = a;
      q.answers = answers;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    if (!canEdit) return;
    setCurrentGame((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions ?? [])];
      const q = { ...questions[qIndex] };
      const answers = q.answers ? [...q.answers] : [];

      const updated = answers.map((ans, idx) => ({
        ...ans,
        isCorrect: idx === aIndex,
      }));

      q.answers = updated;
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  // ====== SAVE (CREATE / UPDATE) ======

  const handleSaveGame = async () => {
    if (!currentGame || !canEdit) return;

    if (!currentGame.name.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: currentGame.name.trim(),
        description: (currentGame.description || "").trim(),
        type: currentGame.type,
        questions: (currentGame.questions ?? []).map((q) => ({
          content: q.content,
          imageUrl: q.imageUrl,
          audioUrl: q.audioUrl,
          answers: (q.answers ?? []).map((a) => ({
            content: a.content,
            isCorrect: a.isCorrect,
            orderIndex: a.orderIndex,
          })),
        })),
      };

      let res: IBackendRes<IGame>;

      if (isCreateMode) {
        res = (await callCreateGame(payload)) as unknown as IBackendRes<IGame>;
      } else {
        res = (await callUpdateGame(
          currentGame._id,
          payload
        )) as unknown as IBackendRes<IGame>;
      }

      if (res.error) {
        toast.error(String(res.error));
        return;
      }

      toast.success(
        isCreateMode ? "Game created successfully" : "Game updated successfully"
      );
      closeGameDialog();
      fetchGames(1, pageSize);
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  // ====== DELETE ======

  const deleteGame = async (id: string) => {
    try {
      const res = (await callDeleteGame(
        id
      )) as unknown as IBackendRes<string>;
      if (res.error) {
        toast.error(String(res.error));
        return;
      }
      toast.success("Game deleted");
      fetchGames(1, pageSize);
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteId(null);
    }
  };

  return {
    // state
    games,
    loading,
    gameDialogOpen,
    dialogMode,
    currentGame,
    dialogLoading,
    saving,
    deleteId,

    // pagination
    page,
    pageSize,
    totalPages,
    totalItems,

    // search/filter
    searchKeyword,
    typeFilter,

    // flags
    isViewMode,
    isCreateMode,
    isEditMode,
    canEdit,

    // setters / actions
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

    // search/filter actions
    setSearchKeyword,
    setTypeFilter,
    applyFilters,
    clearFilters,
  };
};
