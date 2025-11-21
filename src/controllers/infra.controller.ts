import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 

class InfraController {
    
    // POST /api/infra
    public static async createItem(req: Request, res: Response): Promise<Response> {
        const createdByUserId = req.userId;
        const { projectId, category, name, value } = req.body;

        if (!projectId || !name || !category) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        try {
            const newItem = await prisma.infrastructureItem.create({
                data: {
                    projectId,
                    category,
                    name,
                    value,
                    createdByUserId
                }
            });
            return res.status(201).json(newItem);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao adicionar item de infra.' });
        }
    }

    // DELETE /api/infra/:id
    public static async deleteItem(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.infrastructureItem.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover item.' });
        }
    }
}

export default InfraController;