import { Request, Response, NextFunction } from 'express';

// Estende a tipagem do Express para aceitar 'userId'
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    req.userId = 'dev_user_id_123'; 
    
    console.log(`[AuthMiddleware] Request autenticado como: ${req.userId}`);
    
    next();
};