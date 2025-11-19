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

