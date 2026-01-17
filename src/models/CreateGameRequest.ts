import { GameCondition } from "./GameCondition";

export interface CreateGameRequest {
    name: string;
    publisher: string;
    yearPublished: number;
    system: string;
    condition: GameCondition;
}