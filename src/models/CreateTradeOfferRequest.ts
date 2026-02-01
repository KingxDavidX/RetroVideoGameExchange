export interface CreateTradeOfferRequest {
    offeredByUserId: number;
    offeredToUserId: number;
    gameRequestedId: number;
    gameOfferedId: number;
    message?: string;
}