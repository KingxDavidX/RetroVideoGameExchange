import {TradeOfferEntity} from "../entities/TradeOfferEntity";
import {TradeOfferResponse} from "../models/TradeOfferResponse";

export function toTradeOfferResponse (tradeOffer: TradeOfferEntity): TradeOfferResponse {
    return {
        id: tradeOffer.id,
        offeredBy: {
            id: tradeOffer.offeredBy.id,
            name: tradeOffer.offeredBy.name
        },
        offeredTo: {
            id: tradeOffer.offeredTo.id,
            name: tradeOffer.offeredTo.name
        },
        gameRequested: {
            id: tradeOffer.gameRequested.id,
            name: tradeOffer.gameRequested.name,
            owner: {
                id: tradeOffer.gameRequested.owner.id,
                name: tradeOffer.gameRequested.owner.name
            }
        },
        gameOffered: {
            id: tradeOffer.gameOffered.id,
            name: tradeOffer.gameOffered.name,
            owner: {
                id: tradeOffer.gameOffered.owner.id,
                name: tradeOffer.gameOffered.owner.name
            }
        },
        status: tradeOffer.status,
        message: tradeOffer.message,
        createdAt: tradeOffer.createdAt,
        updatedAt: tradeOffer.updatedAt
    };
}