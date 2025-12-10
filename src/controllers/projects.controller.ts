import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 
import { decrypt } from '@utils/encryption'; 

const projectInclude = {
    modules: true,
    infrastructure: true,
    timeline: { orderBy: { startDate: 'asc' as const } },
    client: true,
    createdBy: { select: { id: true, name: true, email: true } },
    members: { select: { id: true, name: true, email: true, role: true } },
    
    // NOVO: Incluir ambientes vinculados e dados do servidor pai
    serverEnvironments: {
        include: {
            server: true 
        }
    }
};

class ProjectsController {
    
    public static async getProjectById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include: projectInclude
            });
            
            if (!project) return res.status(404).json({ error: 'Projeto não encontrado.' });
            
            // Segurança: Se o usuário for Comercial/Coord, poderíamos filtrar aqui também.
            // Por enquanto, enviamos e o front esconde, mas o ideal é filtrar no backend.
            
            const processedProject = {
                ...project,
                serverEnvironments: project.serverEnvironments.map((env) => ({
                    ...env,
                    // Descriptografa a senha do ambiente
                    accessPassword: env.accessPassword ? decrypt(env.accessPassword) : null,
                    server: {
                        ...env.server,
                        password: env.server.password ? decrypt(env.server.password) : null 
                    }
                }))
            };

            return res.status(200).json(processedProject);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro ao buscar o projeto.' });
        }
    }

    public static async listProjects(req: Request, res: Response): Promise<Response> {
        try {
            const projects = await prisma.project.findMany({
                include: projectInclude,
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(projects);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar projetos.' });
        }
    }

    public static async createProject(req: Request, res: Response): Promise<Response> {
        const createdByUserId = req.userId; 
        let { title, status, clientId, modules = [] } = req.body;
        
        if (!title || !createdByUserId) return res.status(400).json({ error: 'Dados incompletos.' });

        try {
            const userExists = await prisma.user.findUnique({ where: { id: createdByUserId } });
            if (!userExists) await prisma.user.create({ data: { id: createdByUserId, name: 'Dev User', email: 'dev@nexus.com', password: '123' } });

            if (!clientId) {
                const defaultClient = await prisma.client.upsert({ where: { internalCode: 'CLIENT_DEV_001' }, update: {}, create: { name: 'Cliente Padrão', internalCode: 'CLIENT_DEV_001' } });
                clientId = defaultClient.id;
            }

            const newProject = await prisma.project.create({
                data: {
                    title,
                    status,
                    clientId,
                    createdByUserId,
                    members: { connect: { id: createdByUserId } },
                    modules: {
                        create: modules.map((m: any) => ({
                            type: m.type, name: m.name, description: m.description, techStack: m.techStack, repoUrl: m.repoUrl, installCmd: m.installCmd, infraDetails: m.infraDetails, createdByUserId
                        }))
                    }
                },
                include: projectInclude,
            });
            return res.status(201).json(newProject);
        } catch (error) { return res.status(500).json({ error: 'Erro ao criar projeto.' }); }
    }

    public static async updateProject(req: Request, res: Response): Promise<Response> {
        const { id } = req.params; const { title, status, infraDetails, documentation, clientId } = req.body;
        try { const updatedProject = await prisma.project.update({ where: { id }, data: { title, status, infraDetails, documentation, clientId }, include: projectInclude }); return res.status(200).json(updatedProject); } catch (error) { return res.status(500).json({ error: 'Erro ao atualizar projeto.' }); }
    }
    
    public static async deleteProject(req: Request, res: Response): Promise<Response> { const { id } = req.params; try { await prisma.project.delete({ where: { id } }); return res.status(204).send(); } catch (error) { return res.status(500).json({ error: "Erro ao excluir projeto." }); } }
    
    public static async addMember(req: Request, res: Response): Promise<Response> { const { id } = req.params; const { userId } = req.body; try { const project = await prisma.project.update({ where: { id }, data: { members: { connect: { id: userId } } }, include: projectInclude }); return res.json(project); } catch (error) { return res.status(500).json({ error: 'Erro.' }); } }
    
    public static async removeMember(req: Request, res: Response): Promise<Response> { const { id, userId } = req.params; try { await prisma.project.update({ where: { id }, data: { members: { disconnect: { id: userId } } } }); return res.status(204).send(); } catch (error) { return res.status(500).json({ error: 'Erro.' }); } }
}

export default ProjectsController;