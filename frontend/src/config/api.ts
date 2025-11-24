import { IAccount, IBackendRes, IGetAccount, IUser } from '@/types/common.type';
import { IGame, IQuestion, IPaginationRes } from '@/types/common.type';
import { IAccount, IBackendRes, IGetAccount, IUser, ILesson } from '@/types/common.type';
import axios from './axios-customize';
import { all } from 'axios';

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
    return axios.get<any>('/api/v1/users', { params: { page: oneIndexedPage, size, sort } });
};

export const callCreateUser = (data: any) => {
    return axios.post<IBackendRes<any>>('/api/v1/users', data);
};

export const callUpdateUser = (userId: string, data: any) => {
    return axios.put<IBackendRes<any>>(`/api/v1/users/${userId}`, data);
};

export const callDeleteUser = (userId: string) => {
    return axios.delete<IBackendRes<any>>(`/api/v1/users/${userId}`);
};

export const callSearchUsers = (data: any, page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.post<any>('/api/v1/users/search', data, { params: { page: oneIndexedPage, size, sort } });
// MODULE GAME

// Lấy list game (có phân trang)
export const callGetGames = (page = 1, size = 20) => {
  return axios.get<IBackendRes<IPaginationRes<IGame>>>('/api/v1/games', {
    params: { page, size },
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

export const callCreateLesson = (lesson: {
    lessontitle: string;
    videourl: string;
    description: string;
}) => {
    return axios.post<IBackendRes<ILesson>>(`/${PREFIX_API}`, lesson);
}

export const callUpdateLesson = (id: string, lesson: {
    lessontitle: string;
    videourl: string;
    description: string;
}) => {
    return axios.put<IBackendRes<ILesson>>(`/${PREFIX_API}/${id}`, lesson);
}

export const callDeleteLesson = (id: string) => {
    return axios.delete<IBackendRes<any>>(`/${PREFIX_API}/${id}`);
}
//MODULE CRUD POINT 
export const callGetAllPoints = (page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.get<any>('/api/v1/points', { params: { page: oneIndexedPage, size, sort } });
};

export const callUpdatePoint = (pointId: number, data: any) => {
    return axios.put<IBackendRes<any>>(`/api/v1/points/${pointId}`, data);
};

export const callDeletePoint = (pointId: number) => {
    return axios.delete<IBackendRes<any>>(`/api/v1/points/${pointId}`);
};

export const callSearchPoints = (data: any, page = 0, size = 10, sort?: string) => {
    const oneIndexedPage = Math.max(1, page + 1);
    return axios.post<any>('/api/v1/points/search', data, { params: { page: oneIndexedPage, size, sort } });
};

