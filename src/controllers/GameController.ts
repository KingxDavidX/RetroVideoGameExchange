import { Controller, Get, Put, Patch, Delete, Route, Body } from "tsoa";
import { GameEntity } from "../entities/GameEntity";
import { UserEntity } from "../entities/UserEntity";
import { AppDataSource } from "../data-source";
import {GameResponse} from "../models/GameResponse";
import {toGameResponse} from "../mappers/GameMapper";
import {UpdateGameRequest} from "../models/UpdateGameRequest";
import {PatchGameRequest} from "../models/PatchGameRequest";

const gameRepo = AppDataSource.getRepository(GameEntity);
const userRepo = AppDataSource.getRepository(UserEntity);

@Route("games")
export class GameController extends Controller {

    @Get("{gameId}")
    public async getGameById(gameId: number): Promise<GameResponse> {
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });


        return toGameResponse(game);
    }

    @Put("{gameId}")
    public async updateGame(gameId: number, @Body() body: UpdateGameRequest): Promise<GameResponse> {
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });

        game.name = body.name;
        game.publisher = body.publisher;
        game.yearPublished = body.yearPublished;
        game.system = body.system;
        game.condition = body.condition;

        await gameRepo.save(game);
        return toGameResponse(game);
    }

    @Patch("{gameId}")
    public async patchGame(gameId: number, @Body() body: PatchGameRequest): Promise<GameResponse> {
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });

        if (body.condition !== undefined) {
            game.condition = body.condition;
        }

        if (body.newOwnerId !== undefined) {
            const newOwner = await userRepo.findOneByOrFail({
                id: body.newOwnerId
            });
            game.owner = newOwner;
        }

        await gameRepo.save(game);
        return toGameResponse(game);
    }

    @Delete("{gameId}")
    public async deleteGame(gameId: number): Promise<void> {
        await gameRepo.delete(gameId);

        this.setStatus(204)
    }

}


