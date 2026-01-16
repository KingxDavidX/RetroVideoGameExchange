export interface NewGame {
    name: string;
    publisher: string;
    yearPublished: number;
    system: string;
    condition: Condition;
    ownerId: number;
}