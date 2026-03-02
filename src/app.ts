// Citations were made by ChatGPT when used

import "reflect-metadata";
// ChatGPT assisted with identifying required reflect-metadata placement
// for TypeOrm decorator metadata resolution

import swaggerDocument from "./generated/swagger.json";
// ChatGPT assisted with resolving ESM-compatible Swagger JSON imports
// and TypeScript resolveJsonModule configuration

import express from 'express';
import swaggerUi from "swagger-ui-express";
import {
    collectDefaultMetrics,
    Counter,
    Histogram,
    Registry,
} from "prom-client";
import { AppDataSource } from "./data-source";
import { RegisterRoutes } from "./generated/routes";

const app = express();
app.use(express.json());

const serviceLabel =
    process.env.METRICS_SERVICE_NAME ||
    process.env.SERVICE_NAME ||
    "retro_video_game_exchange_api";

const metricsRegistry = new Registry();
collectDefaultMetrics({
    register: metricsRegistry,
    prefix: "retro_video_game_exchange_",
});

const httpRequestCount = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["service", "method", "route", "status_code"],
    registers: [metricsRegistry],
});

const httpRequestDurationSeconds = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["service", "method", "route", "status_code"],
    registers: [metricsRegistry],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const getRouteLabel = (req: express.Request) => {
    if (req.route?.path) {
        return `${req.baseUrl || ""}${req.route.path.toString()}`;
    }
    return req.path || "unknown_route";
};

app.use((req, res, next) => {
    if (req.path === "/metrics") {
        return next();
    }

    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
        const durationSeconds = Number(process.hrtime.bigint() - startTime) / 1e9;
        const labels = {
            service: serviceLabel,
            method: req.method,
            route: getRouteLabel(req),
            status_code: res.statusCode.toString(),
        };

        httpRequestCount.inc(labels);
        httpRequestDurationSeconds.observe(labels, durationSeconds);
    });

    next();
});

app.get("/metrics", async (_req, res) => {
    try {
        res.set("Content-Type", metricsRegistry.contentType);
        res.status(200).send(await metricsRegistry.metrics());
    } catch (error) {
        res.status(500).send("Unable to collect metrics");
    }
});

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
            console.log("http://localhost:3000/docs/#/")
        });
    })
    .catch(console.error);


export default app;
