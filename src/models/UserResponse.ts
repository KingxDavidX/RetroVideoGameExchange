export interface UserResponse {
    id: number;
    name: string;
    email: string;
    links: {
        self: string;
        gamesForSale: string;
    };
}