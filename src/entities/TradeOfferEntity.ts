import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {GameEntity} from "./GameEntity";
import {TradeOfferStatus} from "../models/TradeOfferStatus";

@Entity("trade_offers")
export class TradeOfferEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => UserEntity, { eager: true })
    offeredBy!: UserEntity;

    @ManyToOne(() => UserEntity, { eager: true })
    offeredTo!: UserEntity;

    @ManyToOne(() => GameEntity, { eager: true })
    gameRequested!: GameEntity;

    @ManyToOne(() => GameEntity, { eager: true })
    gameOffered!: GameEntity;

    @Column({ type: "enum",  enum: TradeOfferStatus, default: TradeOfferStatus.PENDING })
    status!: TradeOfferStatus;

    @Column({ type:"text", nullable: true })
    message?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}