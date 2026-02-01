import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity";
import { GameEntity } from "./entities/GameEntity";
import {TradeOfferEntity} from "./entities/TradeOfferEntity";

export const AppDataSource = new DataSource({
    // ChatGPT assisted with diagnosing TypeORM connection lifecycle
    // and resolving ConnectionNotFoundError via proper initialization
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "game_exchange",

    synchronize: true,  //Remove after implementation, if this was ever to go into production
    logging: false,

    entities: [UserEntity, GameEntity, TradeOfferEntity ],
});