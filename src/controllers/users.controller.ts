import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 

class UsersController {
    
    // GET /api/users
    public static async listUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    tempPassword: true,
                    createdAt: true,
                    _count: {
                        select: { 
                            projectsCreated: true,
                            memberOf: true 
                        } 
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            
            const formattedUsers = users.map(user => ({
                ...user,
                _count: {
                    projects: user._count.projectsCreated + user._count.memberOf
                }
            }));

            return res.status(200).json(formattedUsers);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    }

    public static async updateUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { role, status, name, email } = req.body;

        try {
            const updatedUser = await prisma.user.update({
                where: { id },
                data: { role, status, name, email }
            });
            const { password, ...userWithoutPassword } = updatedUser;
            return res.status(200).json(userWithoutPassword);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
        }
    }

    // DELETE /api/users/:id
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