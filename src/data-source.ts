import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity";
import { GameEntity } from "./entities/GameEntity";

export const AppDataSource = new DataSource({
    // ChatGPT assisted with diagnosing TypeORM connection lifecycle
    // and resolving ConnectionNotFoundError via proper initialization
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "game_exchange",

    synchronize: true,  //Remove after implementation, if this was ever to go into production
    logging: false,

    entities: [UserEntity, GameEntity],
});