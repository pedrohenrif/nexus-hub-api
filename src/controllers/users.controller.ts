import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 

class UsersController {
    
    public static async listUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { projects: true } 
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    }

    public static async deleteUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.user.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir usuário.' });
        }
    }
}

export default UsersController;