import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    name: string;
    username:string;
    email: string;
    mobile:string;
    password: string;
    role:string;
    hasAcceptedTerms: boolean;
    isLocked: boolean;
    angelClientCode?: string;
    angelApiKey?: string;
    angelTOTPKey?: string;
    angelPassword?: string;
    failedLoginAttempts?: number;
    locked?: boolean;
    lockedAt?: string;
    isLockedAt?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Verification {
    _id?: ObjectId;
    mobile: string;
    otp?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    name: string;
    username?:string;
    email: string;
    mobile?:string;
    role: string;
    hasAcceptedTerms: boolean;
    isLocked?: boolean;
    angelClientCode?: string;
    angelApiKey?: string;
    angelTOTPKey?: string;
    angelPassword?: string;
}
