import { GameCondition } from "./GameCondition";

export interface PatchGameRequest {
    condition?: GameCondition;
    newOwnerId?: number;
}