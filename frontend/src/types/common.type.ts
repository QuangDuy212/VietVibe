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

export interface IAnswer {
  _id?: string;
  content: string;
  isCorrect?: boolean;   
  correct?: boolean; 
  orderIndex?: number;
}


export interface IQuestion {
  _id?: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  answers: IAnswer[];
}

export interface IGame {
    _id: string;          
    name: string;
    description: string;
    type: "MULTIPLE_CHOICE" | "SENTENCE_ORDER" | "LISTENING_CHOICE";
    questions: IQuestion[];
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
export interface ILesson {
        _id: string;
        lessontitle: string;
        videourl: string;
        description: string;

        // Các trường Audit
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        updatedBy: string;

}
