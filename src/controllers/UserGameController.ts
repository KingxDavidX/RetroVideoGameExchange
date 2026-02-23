import { Controller, Get, Route } from "tsoa";
import { GameResponse } from "../models/GameResponse";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../entities/UserEntity";
import { GameEntity } from "../entities/GameEntity";
import { toGameResponse } from "../mappers/GameMapper";

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

        const games = await gameRepo.find({
            where: {
                owner: { id: userId }
            },
            relations: ["owner"]
        });

        return games.map(toGameResponse);
    }

}
