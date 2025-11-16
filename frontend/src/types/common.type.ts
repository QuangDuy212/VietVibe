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
    _id: string;
    username: string;
    name: string;
    address: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
