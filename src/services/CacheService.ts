import { redisClient } from '../redis-client';

export class CacheService {
    private static DEFAULT_TTL = 7200; // 2 hours in seconds

    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
        try {
            await redisClient.setEx(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }

    static async del(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
        }
    }

    static async delPattern(pattern: string): Promise<void> {
        try {
            let cursor = "0";

            do {
                const result = await redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100,
                });

                cursor = result.cursor;

                if (result.keys.length > 0) {
                    await redisClient.del(result.keys);
                }
            } while (cursor !== "0");
        } catch (error) {
            console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
        }
    }

    static async invalidateGameLists(): Promise<void> {
        await this.delPattern(`games:name:*`);
        await this.delPattern(`games:user:*`);
    }

    // User cache keys
    static userKey(userId: number): string {
        return `user:${userId}`;
    }

    static userByEmailKey(email: string): string {
        return `user:email:${email}`;
    }

    // Game cache keys
    static gameKey(gameId: number): string {
        return `game:${gameId}`;
    }

    static gamesByNameKey(name: string): string {
        return `games:name:${name}`;
    }

    // Trade offer cache keys
    static tradeOfferKey(tradeOfferId: number): string {
        return `trade-offer:${tradeOfferId}`;
    }

    static tradeOffersKey(userId?: number, status?: string): string {
        return `trade-offers:${userId || 'all'}:${status || 'all'}`;
    }

    // Invalidation helpers
    static async invalidateUser(userId: number): Promise<void> {
        await this.del(this.userKey(userId));
        await this.delPattern(`user:email:*`);
    }

    static async invalidateGame(gameId: number): Promise<void> {
        await this.del(this.gameKey(gameId));
        await this.invalidateGameLists();
    }

    static async invalidateTradeOffer(tradeOfferId: number): Promise<void> {
        await this.del(this.tradeOfferKey(tradeOfferId));
        await this.delPattern(`trade-offers:*`);
    }

    static async invalidateAllTradeOffers(): Promise<void> {
        await this.delPattern(`trade-offers:*`);
    }
}
