import {TradeOfferStatus} from "./TradeOfferStatus";

export interface TradeOfferResponse {
    id: number;
    offeredBy: { id: number, name: string };
    offeredTo: { id: number, name: string };
    gameRequested: { id: number; name: string, owner: { id: number, name: string }; };
    gameOffered: { id: number; name: string, owner: { id: number, name: string }; };
    status: TradeOfferStatus;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}