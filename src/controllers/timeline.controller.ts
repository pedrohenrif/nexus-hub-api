import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 


class TimelineController {
    
    public static async getGlobalTimeline(req: Request, res: Response): Promise<Response> {
        try {
            const projects = await prisma.project.findMany({
                select: {
                    id: true,
                    title: true,
                    status: true,
                    client: { select: { name: true } },
                    members: { select: { id: true, name: true } }, // Traz os responsáveis
                    timeline: {
                        orderBy: { startDate: 'asc' }
                    }
                },
                // Ordena por cliente para agrupar visualmente
                orderBy: { client: { name: 'asc' } }
            });
            return res.json(projects);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar cronograma global.' });
        }
    }

    // POST /api/timeline
    public static async createPhase(req: Request, res: Response): Promise<Response> {
        // Adicionado estimatedHours na desestruturação
        const { projectId, name, status, startDate, endDate, estimatedHours } = req.body;

        if (!projectId || !name) {
            return res.status(400).json({ error: 'ID do Projeto e Nome da fase são obrigatórios.' });
        }

        try {
            const newPhase = await prisma.timelinePhase.create({
                data: {
                    projectId,
                    name,
                    status: status || 'Pendente',
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    // Garante que seja salvo como número ou 0
                    estimatedHours: estimatedHours ? Number(estimatedHours) : 0 
                }
            });
            return res.status(201).json(newPhase);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao adicionar fase.' });
        }
    }

    // PUT /api/timeline/:id
    public static async updatePhase(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        // Adicionado estimatedHours na desestruturação
        const { name, status, startDate, endDate, estimatedHours } = req.body;

        try {
            const updatedPhase = await prisma.timelinePhase.update({
                where: { id },
                data: {
                    name,
                    status,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    estimatedHours: estimatedHours ? Number(estimatedHours) : 0
                }
            });
            return res.status(200).json(updatedPhase);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar fase.' });
        }
    }

    // DELETE /api/timeline/:id
    public static async deletePhase(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.timelinePhase.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover fase.' });
        }
    }
}

export default TimelineController;