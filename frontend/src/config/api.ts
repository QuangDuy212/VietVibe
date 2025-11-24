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