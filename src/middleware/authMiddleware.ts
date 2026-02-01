import { Request } from 'express';
import { verifyToken, JwtPayload } from "../utils/jwt"

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // Expected Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !==2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

export function authenticateToken(req: AuthenticatedRequest): JwtPayload {
    const token = extractToken(req);

    if (!token) {
        throw new Error('No token provided');
    }

    return verifyToken(token);
}




