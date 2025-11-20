import { IAccount, IBackendRes, IGetAccount, IUser } from '@/types/common.type';
import { IGame, IQuestion, IPaginationRes } from '@/types/common.type';
import axios from './axios-customize';


//MODULE AUTH

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRegister = (data: {username: string , name?: string, password: string, address?: string,role?: string }) => {
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