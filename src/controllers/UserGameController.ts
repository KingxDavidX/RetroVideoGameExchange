import { Body, Controller, Get, Post, Route } from "tsoa";
import { CreateGameRequest } from "../models/CreateGameRequest";
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

    @Post()
    public async createGame(
        userId: number,
        @Body() body: CreateGameRequest
    ): Promise<GameResponse> {
        // ChatGPT helped with this line, I had issues with userId and didn't realize I have to
        // set it to id.
        const user = await userRepo.findOneByOrFail({ id: userId });

        const game = gameRepo.create({
            name: body.name,
            publisher: body.publisher,
            yearPublished: body.yearPublished,
            system: body.system,
            condition: body.condition,
            owner: user,
        })

        this.setStatus(201)
        await gameRepo.save(game);
        return toGameResponse(game);
    }

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