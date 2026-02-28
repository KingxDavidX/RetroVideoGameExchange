export enum NotificationEventType {
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    TRADE_OFFER_CREATED = "TRADE_OFFER_CREATED",
    TRADE_OFFER_ACCEPTED = "TRADE_OFFER_ACCEPTED",
    TRADE_OFFER_REJECTED = "TRADE_OFFER_REJECTED",
}

export interface NotificationEvent {
    eventType: NotificationEventType;
    recipientUserId: number;
    recipientEmail: string;
    payload: Record<string, unknown>;
    occurredAt: string;
}

type KafkaMessage = { key: string; value: string };
type KafkaProducer = {
    connect: () => Promise<void>;
    send: (args: { topic: string; messages: KafkaMessage[] }) => Promise<void>;
};

const brokers = (process.env.KAFKA_BROKERS || "")
    .split(",")
    .map((broker) => broker.trim())
    .filter((broker) => broker.length > 0);

const userTopic = process.env.KAFKA_USER_TOPIC || "user";
const offersTopic = process.env.KAFKA_OFFERS_TOPIC || "offers";
const clientId = process.env.KAFKA_CLIENT_ID || "retro-game-exchange-api";

let producer: KafkaProducer | null = null;
let producerConnectPromise: Promise<void> | null = null;

function loadKafkaProducer(): KafkaProducer | null {
    try {
        const { Kafka } = require("kafkajs") as {
            Kafka: new (args: { clientId: string; brokers: string[] }) => {
                producer: () => KafkaProducer;
            };
        };

        const kafka = new Kafka({ clientId, brokers });
        return kafka.producer();
    } catch {
        return null;
    }
}

async function getProducer(): Promise<KafkaProducer | null> {
    if (brokers.length === 0) {
        return null;
    }

    if (!producer) {
        producer = loadKafkaProducer();
    }

    if (!producer) {
        return null;
    }

    if (!producerConnectPromise) {
        producerConnectPromise = producer.connect();
    }

    await producerConnectPromise;
    return producer;
}

export async function publishNotificationEvents(events: NotificationEvent[]): Promise<void> {
    if (events.length === 0) {
        return;
    }

    const kafkaProducer = await getProducer();

    if (!kafkaProducer) {
        console.warn("Kafka producer unavailable. Set KAFKA_BROKERS and install kafkajs to publish notification events.");
        return;
    }

    const userEvents = events.filter((event) => event.eventType === NotificationEventType.PASSWORD_CHANGED);
    const offerEvents = events.filter((event) => event.eventType !== NotificationEventType.PASSWORD_CHANGED);

    if (userEvents.length > 0) {
        await kafkaProducer.send({
            topic: userTopic,
            messages: userEvents.map((event) => ({
                key: String(event.recipientUserId),
                value: JSON.stringify(event),
            })),
        });
    }

    if (offerEvents.length > 0) {
        await kafkaProducer.send({
            topic: offersTopic,
            messages: offerEvents.map((event) => ({
                key: String(event.recipientUserId),
                value: JSON.stringify(event),
            })),
        });
    }
}
