import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 

class ModulesController {
    
    // POST /api/modules - Adiciona um módulo a um projeto
    public static async createModule(req: Request, res: Response): Promise<Response> {
        const createdByUserId = req.userId; // Vem do middleware de auth
        // Recebemos os dados do frontend
        const { projectId, name, type, description, techStack, repoUrl, installCmd, infraDetails } = req.body;

        if (!projectId || !name || !type) {
            return res.status(400).json({ error: 'ID do Projeto, Nome e Tipo são obrigatórios.' });
        }

        try {
            const newModule = await prisma.module.create({
                data: {
                    projectId,
                    name,
                    type,
                    description,
                    techStack,
                    repoUrl,
                    installCmd,
                    infraDetails,
                    createdByUserId
                }
            });

            return res.status(201).json(newModule);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao adicionar módulo.' });
        }
    }

    public static async updateModule(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, type, description, techStack, repoUrl, installCmd, infraDetails } = req.body;

        try {
            const updatedModule = await prisma.module.update({
                where: { id },
                data: {
                    name,
                    type,
                    description,
                    techStack,
                    repoUrl,
                    installCmd,
                    infraDetails
                }
            });
            return res.status(200).json(updatedModule);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar módulo.' });
        }
    }

    // DELETE /api/modules/:id
    public static async deleteModule(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        try {
            await prisma.module.delete({
                where: { id }
            });
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao remover módulo.' });
        }
    }
}

export default ModulesController;