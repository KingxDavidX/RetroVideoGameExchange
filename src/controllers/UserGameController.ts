import { Controller, Get, Route } from "tsoa";
import { GameResponse } from "../models/GameResponse";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../entities/UserEntity";
import { GameEntity } from "../entities/GameEntity";
import { toGameResponse } from "../mappers/GameMapper";
import { CacheService } from "../services/CacheService";

const userRepo = AppDataSource.getRepository(UserEntity);
const gameRepo = AppDataSource.getRepository(GameEntity);

@Route("users/{userId}/games")
export class UserGameController extends Controller{
    // This comment was not made by ChatGPT,
    // ChatGPT recommended I move these methods out of GameController
    // Because of path confliction.

    @Get()
    public async getByUser(userId: number): Promise<GameResponse[]> {
        await userRepo.findOneByOrFail({ id: userId });

        // Try to get from cache
        const cacheKey = `games:user:${userId}`;
        const cachedGames = await CacheService.get<GameEntity[]>(cacheKey);
        let games = cachedGames;

        if (!games) {
            games = await gameRepo.find({
                where: {
                    owner: { id: userId }
                },
                relations: ["owner"]
            });
            await CacheService.set(cacheKey, games);
        }

        return games.map(toGameResponse);
    }

}
