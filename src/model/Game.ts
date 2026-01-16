import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    publisher!: string;

    @Column()
    yearPublished!: number;

    @Column()
    system!: string;

    @Column()
    condition!: Condition;

    @Column()
    ownerId!: number;
}