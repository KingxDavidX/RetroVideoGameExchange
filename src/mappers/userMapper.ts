import { UserEntity } from '../entities/UserEntity';
import { UserResponse } from "../models/UserResponse";

export function toUserResponse(user: UserEntity): UserResponse {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        links: {
            self: 'users/${user.id}',
            gamesForSale: '/users/{$user.id}/games'
        }
    };
}