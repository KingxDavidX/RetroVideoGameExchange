import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
    userId: number;
    email: string;
}

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired token')
    }
}

