import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { GameEntity } from "./GameEntity";

@Entity({ name: "users" })
export class UserEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    passwordHash!: string;

    @Column({ type: "varchar", length: 255 })
    streetAddress!: string;

    @OneToMany(type => GameEntity, game => game.owner, {
        cascade: true,
        onDelete: "CASCADE",
    })
    games!: GameEntity[];
}