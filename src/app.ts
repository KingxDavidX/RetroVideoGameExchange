import { AppDataSource } from "./data-source";
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log("AppDataSource initialized");

        app.listen(3000, () => {
            console.log("server running on port 3000");
        });
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});
