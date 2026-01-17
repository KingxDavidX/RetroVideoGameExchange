import { GameCondition } from "./GameCondition";

export interface GameResponse {
    id: number;
    name: string;
    publisher: string;
    yearPublished: number;
    system: string;
    condition: GameCondition;

    links: {
        self: string;
        owner: string;
    };
}