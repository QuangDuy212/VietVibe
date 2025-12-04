export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}


export interface IAccount {
    access_token: string;
    user: {
        _id: string
        address: string
        createdAt: string
        createdBy: string
        name: string
        role: string
        updatedAt: string
        updatedBy: string
        username: string
    }
}

export type IGetAccount = Omit<IAccount, "access_token">

export interface IUser {
    username: string;
    _id: string;
    name: string;
    address: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface PointResponse {
    id: number;
    score: number;
    bonus: number;
    correctAnswers?: number;
    totalQuestions?: number;
    totalScore?: number;
    createdAt?: string;
    userId?: string;
    userName?: string;
    gameId?: number;
    gameName?: string;
}

export interface IPointUpdateRequest {
    score?: number;
    bonus?: number;
}

export interface IPointSearchRequest {
    keyword?: string;
    username?: string;
    gameName?: string;
    minScore?: number;
    maxScore?: number;
}



export interface IPaginationMeta {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
}

export interface IPaginationRes<T> {
    meta: IPaginationMeta;
    result: T[];
}
