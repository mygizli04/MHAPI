import { User } from "./users";

export interface ErrorResponse {
    success: false,
    reason: string
}

export interface CheckSuccessResponse {
    success: true,
    user: User
}