import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_padrao_dev';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    userRole?: string;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no token.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformatado.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        
        req.userId = decoded.id;
        req.userRole = decoded.role;

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};