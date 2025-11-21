import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 

class ClientsController {
    
    // GET /api/clients
    public static async listClients(req: Request, res: Response): Promise<Response> {
        try {
            const clients = await prisma.client.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { projects: true } // Traz a contagem de projetos deste cliente
                    }
                }
            });
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar clientes.' });
        }
    }

    // POST /api/clients
    public static async createClient(req: Request, res: Response): Promise<Response> {
        const { name, internalCode } = req.body;
        
        if (!name || !internalCode) {
             return res.status(400).json({ error: 'Nome e Código Interno são obrigatórios.' });
        }

        try {
            const existingClient = await prisma.client.findUnique({ where: { internalCode } });
            if (existingClient) {
                return res.status(409).json({ error: 'Já existe um cliente com este código.' });
            }

            const newClient = await prisma.client.create({
                data: { name, internalCode }
            });

            return res.status(201).json(newClient);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar cliente.' });
        }
    }

    // NOVO: PUT /api/clients/:id
    public static async updateClient(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, internalCode } = req.body;

        try {
            const updatedClient = await prisma.client.update({
                where: { id },
                data: { name, internalCode }
            });
            return res.status(200).json(updatedClient);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar cliente.' });
        }
    }

    // NOVO: DELETE /api/clients/:id
    public static async deleteClient(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.client.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            // P2003 é erro de Foreign Key (se tiver projetos vinculados)
            // Você pode tratar isso no front ou aqui
            return res.status(500).json({ error: 'Erro ao excluir cliente. Verifique se há projetos vinculados.' });
        }
    }
}

export default ClientsController;