import { IAccount, IBackendRes, IGetAccount, IUser } from '@/types/common.type';
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

