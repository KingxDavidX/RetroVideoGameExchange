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

const topic = process.env.KAFKA_NOTIFICATION_TOPIC || "email-notifications";
const clientId = process.env.KAFKA_CLIENT_ID || "retro-game-exchange-api";

let producer: KafkaProducer | null = null;
let producerConnectPromise: Promise<void> | null = null;

function loadKafkaProducer(): KafkaProducer | null {
    try {
        // Optional runtime dependency: install `kafkajs` to enable publishing.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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

    await kafkaProducer.send({
        topic,
        messages: events.map((event) => ({
            key: String(event.recipientUserId),
            value: JSON.stringify(event),
        })),
    });
}
