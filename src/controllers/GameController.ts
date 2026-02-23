import { Controller, Get, Put, Patch, Delete, Post, Route, Body, Request } from "tsoa";
import { GameEntity } from "../entities/GameEntity";
import { AppDataSource } from "../data-source";
import {GameResponse} from "../models/GameResponse";
import {toGameResponse} from "../mappers/GameMapper";
import {UpdateGameRequest} from "../models/UpdateGameRequest";
import {PatchGameRequest} from "../models/PatchGameRequest";
import { AuthenticatedRequest, authenticateToken } from "../middleware/authMiddleware";
import { CreateGameRequest } from "../models/CreateGameRequest";
import { UserEntity } from "../entities/UserEntity";

const gameRepo = AppDataSource.getRepository(GameEntity);
const userRepo = AppDataSource.getRepository(UserEntity);

@Route("games")
export class GameController extends Controller {
    @Post()
    public async createGame(
        @Request() request: AuthenticatedRequest,
        @Body() body: CreateGameRequest
    ): Promise<GameResponse> {
        const authUser = authenticateToken(request);
        const user = await userRepo.findOneByOrFail({ id: authUser.userId });

        const game = gameRepo.create({
            name: body.name,
            publisher: body.publisher,
            yearPublished: body.yearPublished,
            system: body.system,
            condition: body.condition,
            owner: user,
        });

        this.setStatus(201);
        await gameRepo.save(game);
        return toGameResponse(game);
    }

    @Get("{name}")
    public async getGameByName(name: string): Promise<GameResponse[]> {
        const games = await gameRepo.find({
            where: { name },
            relations: ["owner"]
        });

        return games.map(toGameResponse);
    }

    @Get("by-name/{gameId}")
    public async getGameById(gameId: number): Promise<GameResponse> {
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });


        return toGameResponse(game);
    }

    @Put("{gameId}")
    public async updateGame(
        gameId: number,
        @Request() request: AuthenticatedRequest,
        @Body() body: UpdateGameRequest
    ): Promise<GameResponse> {
        const authUser = authenticateToken(request);
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });

        if (game.owner.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("You can only update your own games");
        }

        game.name = body.name;
        game.publisher = body.publisher;
        game.yearPublished = body.yearPublished;
        game.system = body.system;
        game.condition = body.condition;

        await gameRepo.save(game);
        return toGameResponse(game);
    }

    @Patch("{gameId}")
    public async patchGame(
        gameId: number,
        @Request() request: AuthenticatedRequest,
        @Body() body: PatchGameRequest
    ): Promise<GameResponse> {
        const authUser = authenticateToken(request);
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });

        if (game.owner.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("You can only update your own games");
        }

        if (body.condition !== undefined) {
            game.condition = body.condition;
        }

        await gameRepo.save(game);
        return toGameResponse(game);
    }

    @Delete("{gameId}")
    public async deleteGame(
        gameId: number,
        @Request() request: AuthenticatedRequest
    ): Promise<void> {
        const authUser = authenticateToken(request);
        const game = await gameRepo.findOneOrFail({
            where: { id: gameId },
            relations: ["owner"]
        });

        if (game.owner.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("You can only delete your own games");
        }

        await gameRepo.delete(gameId);

        this.setStatus(204)
    }

}
