import { Controller, Get, Post, Patch, Delete, Route, Body, Path, Query, Request} from "tsoa";
import {TradeOfferStatus} from "../models/TradeOfferStatus";
import {TradeOfferResponse} from "../models/TradeOfferResponse";
import {AppDataSource} from "../data-source";
import {TradeOfferEntity} from "../entities/TradeOfferEntity";
import {UserEntity} from "../entities/UserEntity";
import {GameEntity} from "../entities/GameEntity";
import { toTradeOfferResponse } from "../mappers/TradeOfferMapper";
import {CreateTradeOfferRequest} from "../models/CreateTradeOfferRequest";
import {UpdateTradeOfferStatusRequest} from "../models/UpdateTradeOfferStatusRequest";
import {AuthenticatedRequest, authenticateToken} from "../middleware/authMiddleware";

const tradeOfferRepo = AppDataSource.getRepository(TradeOfferEntity);
const userRepo = AppDataSource.getRepository(UserEntity);
const gameRepo = AppDataSource.getRepository(GameEntity);


@Route("trade-offers")
export class TradeOfferController extends Controller {

    @Get()
    public async getTradeOffers( @Request() request: AuthenticatedRequest, @Query() userId?: number, @Query() status?: TradeOfferStatus ): Promise<TradeOfferResponse[]> {
        authenticateToken(request);

        const queryBuilder = tradeOfferRepo.createQueryBuilder("tradeOffer")
            .leftJoinAndSelect("tradeOffer.offeredBy", "offeredBy")
            .leftJoinAndSelect("tradeOffer.offeredTo", "offeredTo")
            .leftJoinAndSelect("tradeOffer.gameOffered", "gameOffered")
            .leftJoinAndSelect("gameOffered.owner", "offeredOwner")
            .leftJoinAndSelect("tradeOffer.gameRequested", "gameRequested")
            .leftJoinAndSelect("gameRequested.owner", "requestedOwner");

        if (userId) {
            queryBuilder.andWhere(
                "(tradeOffer.offeredById = :userId OR tradeOffer.offeredToId = :userId)",
                { userId }
            );
        }

        if (status) {
            queryBuilder.andWhere("tradeOffer.status = :status", { status });
        }

        const tradeOffers = await queryBuilder.getMany();
        return tradeOffers.map(toTradeOfferResponse);
    }

    @Get("{id}")
    public async getTradeOffer(@Request() request: AuthenticatedRequest, @Path() id: number): Promise<TradeOfferResponse> {
        authenticateToken(request);

        const tradeOffer = await tradeOfferRepo.findOneOrFail({
            where: { id },
            relations: [
                "offeredBy",
                "offeredTo",
                "gameOffered",
                "gameOffered.owner",
                "gameRequested",
                "gameRequested.owner"
            ]
        });

        return toTradeOfferResponse(tradeOffer);
    }

    @Post()
    public async createTradeOffer( @Request() request: AuthenticatedRequest, @Body() body: CreateTradeOfferRequest): Promise<TradeOfferResponse> {
        const authUser = authenticateToken(request);

        const gameOffered = await gameRepo.findOneOrFail({
            where: { id: body.gameOfferedId },
            relations: ["owner"]
        });

        const gameRequested = await gameRepo.findOneOrFail({
            where: { id: body.gameRequestedId },
            relations: ["owner"]
        });

        if (gameOffered.owner.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("You can only offer games that you own")
        }

        if (gameOffered.owner.id === gameRequested.owner.id) {
            this.setStatus(400);
            throw new Error("Cannot create a trade offer with yourself");
        }

        if(body.gameOfferedId === body.gameRequestedId) {
            this.setStatus(400);
            throw new Error("Cannot offer and request the same game");
        }

        const tradeOffer = tradeOfferRepo.create({
            offeredBy: gameOffered.owner,
            offeredTo: gameRequested.owner,
            gameOffered,
            gameRequested,
            message: body.message,
            status: TradeOfferStatus.PENDING
        });

        await tradeOfferRepo.save(tradeOffer);
        this.setStatus(201);

        return toTradeOfferResponse(tradeOffer);
    }

    @Patch("{id}/status")
    public async updateTradeOfferStatus(@Request() request: AuthenticatedRequest, @Path() id:number, @Body() body: UpdateTradeOfferStatusRequest): Promise<TradeOfferResponse> {
        const authUser = authenticateToken(request);

        const tradeOffer = await tradeOfferRepo.findOneOrFail({
            where: { id },
            relations: [
                "offeredBy",
                "offeredTo",
                "gameOffered",
                "gameOffered.owner",
                "gameRequested",
                "gameRequested.owner"
            ]
        });

        if (tradeOffer.offeredTo.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("Only the recipient of the trade offer can response to it")
        }

        if (tradeOffer.status !== TradeOfferStatus.PENDING) {
            this.setStatus(400);
            throw new Error("Can only update pending trade offers");
        }

        tradeOffer.status = body.status;

        if (body.status === TradeOfferStatus.ACCEPTED) {
            const gameOffered = tradeOffer.gameOffered;
            const gameRequested = tradeOffer.gameRequested;

            const originalOfferedOwner = gameOffered.owner;
            const originalRequestedOwner = gameRequested.owner;

            gameOffered.owner = originalRequestedOwner;
            gameRequested.owner = originalOfferedOwner;

            await gameRepo.save([gameOffered, gameRequested]);
        }

        await tradeOfferRepo.save(tradeOffer);
        return toTradeOfferResponse(tradeOffer);
    }

    @Delete("{id}")
    public async deleteTradeOffer(@Request() request: AuthenticatedRequest, @Path() id: number): Promise<void> {
        const authUser = authenticateToken(request);

        const tradeOffer = await tradeOfferRepo.findOneOrFail({
            where: { id },
            relations: ["offeredBy"]
        });

        if (tradeOffer.offeredBy.id !== authUser.userId) {
            this.setStatus(403);
            throw new Error("Only the creator of the trade offer can delete it")
        }

        if (tradeOffer.status === TradeOfferStatus.ACCEPTED) {
            this.setStatus(400);
            throw new Error("Cannot delete accepted trade offers");
        }

        await tradeOfferRepo.delete(id);
        this.setStatus(204);
    }


}

