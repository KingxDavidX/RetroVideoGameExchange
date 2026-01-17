import {GameEntity} from "../entities/GameEntity";
import {GameResponse} from "../models/GameResponse";

export function toGameResponse(game: GameEntity): GameResponse {
    return {
        id: game.id,
        name: game.name,
        publisher: game.publisher,
        yearPublished: game.yearPublished,
        system: game.system,
        condition: game.condition,
        links: {
            self: `/games/${game.id}`,
            owner: `/users/${game.owner.id}`
        }
    };
}