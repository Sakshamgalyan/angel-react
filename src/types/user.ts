import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    email: string;
    password: string;
    name: string;
    hasAcceptedTerms: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    hasAcceptedTerms: boolean;
}
