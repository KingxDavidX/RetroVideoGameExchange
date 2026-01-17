// Citations were made by ChatGPT when used

import "reflect-metadata";
// ChatGPT assisted with identifying required reflect-metadata placement
// for TypeOrm decorator metadata resolution

import swaggerDocument from "./generated/swagger.json";
// ChatGPT assisted with resolving ESM-compatible Swagger JSON imports
// and TypeScript resolveJsonModule configuration

import express from 'express';
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import { RegisterRoutes } from "./generated/routes";

const app = express();
app.use(express.json());

// ChatGPT assisted with restructuring app initialization to ensure
// database connection is established before route registration
AppDataSource.initialize()
    .then(() => {
        console.log("DB initialized");

        RegisterRoutes(app);

        app.use(
            "/docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument)
        );
        // ChatGPT assisted with Swagger UI Express integration

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch(console.error);


export default app;

