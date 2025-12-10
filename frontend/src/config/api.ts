
import { IGame, IQuestion, IPaginationRes, IVocabulary, ILessonDetail, PointResponse, IPointUpdateRequest, IPointSearchRequest, UserStatsResponse } from '@/types/common.type';
import { IAccount, IBackendRes, IGetAccount, IUser, ILesson } from '@/types/common.type';
import axios from './axios-customize';

//MODULE AUTH
export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRegister = (data: { username: string, name?: string, password: string, address?: string, role?: string }) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', data)
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callRefreshToken = () => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

// MODULE  USER
export const callGetAllUsers = (page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.get<unknown>('/api/v1/users', { params: { page: oneIndexedPage, size, sort } });
};

// Create vocabularies in batch (controller expects POST /api/v1/vocabularies/batch)
export const callCreateVocabulariesBatch = (
  data: Array<{
    word: string;
    englishMeaning: string;
    exampleSentence?: string;
    lessonId: string;
  }>
) => {
  return axios.post<IBackendRes<unknown>>(`/api/v1/vocabularies/batch`, data);
};

export const callCreateUser = (data: unknown) => {
    return axios.post<IBackendRes<unknown>>('/api/v1/users', data);
};

export const callUpdateUser = (userId: string, data: unknown) => {
    return axios.put<IBackendRes<unknown>>(`/api/v1/users/${userId}`, data);
};

export const callDeleteUser = (userId: string) => {
    return axios.delete<IBackendRes<unknown>>(`/api/v1/users/${userId}`);
};

export const callSearchUsers = (data: unknown, page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.post<unknown>('/api/v1/users/search', data, { params: { page: oneIndexedPage, size, sort } });
}
// MODULE GAME
// Lấy list game (phân trang + filter BE)
export const callGetGames = (page = 1, size = 20, filter?: string) => {
  return axios.get<IBackendRes<IPaginationRes<IGame>>>("/api/v1/games", {
    params: {
      page,
      size,
      ...(filter ? { filter } : {}),
    },
  });
};

// Lấy chi tiết 1 game theo id
export const callGetGameDetail = (id: string) => {
    return axios.get<IBackendRes<IGame>>(`/api/v1/games/${id}`);
};

// Tạo game mới
export const callCreateGame = (data: {
    name: string;
    description: string;
    type: IGame["type"];
    questions?: IQuestion[];
}) => {
    return axios.post<IBackendRes<IGame>>("/api/v1/games/create", data);
};

export const callUpdateGame = (
    id: string,
    data: {
        name: string;
        description: string;
        type: IGame["type"];
        questions?: IQuestion[];
    }
) => {
    return axios.put<IBackendRes<IGame>>(`/api/v1/games/${id}`, data);
};

// Xóa game
export const callDeleteGame = (id: string) => {
    return axios.delete<IBackendRes<string>>(`/api/v1/games/${id}`);
};
//MODULE LESSONS
const PREFIX_API = "api/v1/lessons";

export const callFetchLessons = () => {
    return axios.get<IBackendRes<ILesson[]>>(`/${PREFIX_API}/all`);
}

export const callFetchLessonsPaginated = (page: number = 1, size: number = 5) => {
  return axios.get<IBackendRes<IPaginationRes<ILesson>>>(`/api/v1/lessons`, {
    params: { page, size }
  });
};

export const callCreateLesson = (lesson: {
    lessontitle: string;
    videourl: string;
    description: string;
    vocabulary?: Array<{ word: string; englishMeaning: string; exampleSentence: string }>;
    lessonDetail?: { gramma: string; vocab: string; phonetic: string };
}) => {
    return axios.post<IBackendRes<ILesson>>(`/${PREFIX_API}`, lesson);
}

export const callUpdateLesson = (id: string, lesson: {
    lessontitle: string;
    videourl: string;
    description: string;
    vocabulary?: Array<{ word: string; englishMeaning: string; exampleSentence: string }>;
    lessonDetail?: { gramma: string; vocab: string; phonetic: string };
}) => {
    return axios.put<IBackendRes<ILesson>>(`/${PREFIX_API}/${id}`, lesson);
}

export const callDeleteLesson = (id: string) => {
    return axios.delete<IBackendRes<unknown>>(`/${PREFIX_API}/${id}`);
}

export const callFetchVocbulary = (lessonId: string) => {
  return axios.get<IBackendRes<IVocabulary[]>>(`/api/v1/vocabularies/lesson/${lessonId}`);
}

export const callFetchLessonDetail = (lessonId: string) => {
  return axios.get<IBackendRes<ILessonDetail>>(`/api/v1/lesson-details/lesson/${lessonId}`);
}

export const callCreateVocabulary = (
  data:
    | {
        word: string;
        englishMeaning: string;
        exampleSentence: string;
        lessonId: string;
      }
    | Array<{
        word: string;
        englishMeaning: string;
        exampleSentence: string;
        lessonId: string;
      }>
) => {
  // If an array is passed, wrap it in an object payload the backend may expect
  if (Array.isArray(data)) {
    return axios.post<IBackendRes<IVocabulary | IVocabulary[]>>(
      "/api/v1/vocabularies/batch",
      { vocabularies: data }
    );
  }

  return axios.post<IBackendRes<IVocabulary>>("/api/v1/vocabularies", data);
};

export const callUpdateVocabulary = (id: string, data: {
  word?: string;
  englishMeaning?: string;
  exampleSentence?: string;
  lessonId?: string;
}) => {
  return axios.put<IBackendRes<IVocabulary>>(`/api/v1/vocabularies/${id}`, data);
}

export const callDeleteVocabulary = (id: string) => {
  return axios.delete<IBackendRes<string>>(`/api/v1/vocabularies/${id}`);
}

export const callCreateLessonDetail = (data: {
  gramma: string;
  vocab: string;
  phonetic: string;
  lessonId: string;
}) => {
  return axios.post<IBackendRes<ILessonDetail>>("/api/v1/lesson-details", data);
}

export const callUpdateLessonDetail = (id: string, data: {
  gramma?: string;
  vocab?: string;
  phonetic?: string;
  lessonId?: string;
}) => {
  return axios.put<IBackendRes<ILessonDetail>>(`/api/v1/lesson-details/${id}`, data);
}

export const callDeleteLessonDetail = (id: string) => {
  return axios.delete<IBackendRes<string>>(`/api/v1/lesson-details/${id}`);
}


//MODULE CRUD POINT 
export const callGetAllPoints = (page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.get<IBackendRes<IPaginationRes<PointResponse>>>('/api/v1/points', { params: { page: oneIndexedPage, size, sort } });
};

export const callUpdatePoint = (pointId: number, data: IPointUpdateRequest) => {
    return axios.put<IBackendRes<PointResponse>>(`/api/v1/points/${pointId}`, data);
};

export const callDeletePoint = (pointId: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/points/${pointId}`);
};

export const callSearchPoints = (data: IPointSearchRequest, page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.post<IBackendRes<IPaginationRes<PointResponse>>>('/api/v1/points/search', data, { params: { page: oneIndexedPage, size, sort } });
};

// Mới: Start play to increment timesPlayed
export const callStartPlayGame = (id: string) => {
    return axios.post<IBackendRes<void>>(`/api/v1/games/${id}/play`);
};

// Mới: Create point khi chơi xong
export const callCreatePoint = (data: {
    userId: string;
    gameId: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}) => {
    return axios.post<IBackendRes<PointResponse>>('/api/v1/points/add', data);
};

// Mới: Get user stats
export const callGetUserStats = (userId: string) => {
    return axios.get<IBackendRes<UserStatsResponse>>(`/api/v1/points/user/${userId}/stats`);
};

//MODULE FILE UPLOAD
export const callUploadFile = (file: unknown, folderType: string) => {
  const bodyFormData = new FormData();
  //@ts-expect-error
  bodyFormData.append('file', file);
  bodyFormData.append('folder', folderType);

  return axios<IBackendRes<{ fileName: string }>>({
      method: 'post',
      url: '/api/v1/files',
      data: bodyFormData,
      headers: {
          "Content-Type": "multipart/form-data",
      },
  });
}
