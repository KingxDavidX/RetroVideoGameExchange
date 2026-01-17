import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./UserEntity";
import { GameCondition } from "../models/GameCondition";

@Entity({ name: 'games' })
export class GameEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255 })
    publisher!: string;

    @Column({ type: "int"})
    yearPublished!: number;

    @Column({ type: "varchar", length: 255 })
    system!: string;

    @Column({ type: 'enum', enum: GameCondition })
    condition!: GameCondition;

    @ManyToOne(() => UserEntity, user => user.games, {
        onDelete: "CASCADE",
    })
    owner!: UserEntity;
}