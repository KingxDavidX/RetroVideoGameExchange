import {GameCondition} from "./GameCondition";

export interface UpdateGameRequest {
    name: string;
    publisher: string;
    yearPublished: number;
    system: string;
    condition: GameCondition;
}