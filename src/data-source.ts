import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./model/User";
import {Game} from "./model/Game";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "game_exchange",

    synchronize: true,  //Remove after implementation
    logging: false,

    entities: [User, Game],
});