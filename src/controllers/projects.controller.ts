import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 
import { decrypt } from '@utils/encryption'; 

const projectInclude = {
    modules: true,
    infrastructure: true,
    timeline: { orderBy: { startDate: 'asc' as const } },
    client: true,
    createdBy: { select: { id: true, name: true, email: true } },
    owner: { select: { id: true, name: true, email: true } }, 
    members: { select: { id: true, name: true, email: true, role: true } },
    serverEnvironments: {
        include: {
            server: true 
        }
    }
};

class ProjectsController {
    
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

    public static async getProjectById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include: projectInclude
            });
            if (!project) return res.status(404).json({ error: 'Projeto não encontrado.' });
            
            const processedProject = {
                ...project,
                serverEnvironments: project.serverEnvironments.map((env) => ({
                    ...env,
                    accessPassword: env.accessPassword ? decrypt(env.accessPassword) : null,
                    server: {
                        ...env.server,
                        password: env.server.password ? decrypt(env.server.password) : null 
                    }
                }))
            };
            return res.status(200).json(processedProject);
        } catch (error) { return res.status(500).json({ error: 'Erro ao buscar o projeto.' }); }
    }

    public static async createProject(req: Request, res: Response): Promise<Response> {
        const createdByUserId = req.userId; 
        // Adicionado ownerId
        let { title, status, type, clientId, ownerId, modules = [] } = req.body;
        
        if (!title || !createdByUserId) return res.status(400).json({ error: 'Dados incompletos.' });

        try {
            const userExists = await prisma.user.findUnique({ where: { id: createdByUserId } });
            if (!userExists) await prisma.user.create({ data: { id: createdByUserId, name: 'Dev User', email: 'dev@nexus.com', password: '123' } });

            if (!clientId) {
                const defaultClient = await prisma.client.upsert({ where: { internalCode: 'CLIENT_DEV_001' }, update: {}, create: { name: 'Cliente Padrão', internalCode: 'CLIENT_DEV_001' } });
                clientId = defaultClient.id;
            }

            // Se não veio ownerId, assume que o criador é o dono
            const finalOwnerId = ownerId || createdByUserId;

            const newProject = await prisma.project.create({
                data: {
                    title,
                    status,
                    type: type || 'Projeto',
                    clientId,
                    createdByUserId,
                    ownerId: finalOwnerId, // <--- Define o dono
                    
                    // Adiciona o criador e o dono (se for diferente) como membros
                    members: {
                        connect: Array.from(new Set([createdByUserId, finalOwnerId])).map(id => ({ id }))
                    },
                    modules: {
                        create: modules.map((m: any) => ({
                            type: m.type, name: m.name, description: m.description, techStack: m.techStack, repoUrl: m.repoUrl, installCmd: m.installCmd, infraDetails: m.infraDetails, createdByUserId
                        }))
                    }
                },
                include: projectInclude,
            });
            return res.status(201).json(newProject);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar projeto.' });
        }
    }

    public static async updateProject(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        // Adicionado ownerId
        const { title, status, type, infraDetails, documentation, clientId, ownerId } = req.body;

        try {
            // Prepara dados de atualização
            const updateData: any = { title, status, type, infraDetails, documentation, clientId };
            
            // Se veio ownerId, atualiza o dono E garante que ele esteja na lista de membros
            if (ownerId) {
                updateData.ownerId = ownerId;
                updateData.members = { connect: { id: ownerId } };
            }

            const updatedProject = await prisma.project.update({
                where: { id },
                data: updateData,
                include: projectInclude
            });
            return res.status(200).json(updatedProject);
        } catch (error) { 
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar projeto.' }); 
        }
    }
    
    public static async deleteProject(req: Request, res: Response): Promise<Response> { 
        const { id } = req.params; 
        try { 
            await prisma.project.delete({ where: { id } }); 
            return res.status(204).send(); 
        } catch (error) { 
            return res.status(500).json({ error: "Erro ao excluir projeto." }); 
        } 
    }
    
    public static async addMember(req: Request, res: Response): Promise<Response> { 
        const { id } = req.params; 
        const { userId } = req.body; 
        try { 
            const project = await prisma.project.update({ 
                where: { id }, 
                data: { members: { connect: { id: userId } } }, 
                include: projectInclude 
            }); 
            return res.json(project); 
        } catch (error) { 
            return res.status(500).json({ error: 'Erro.' }); 
        } 
    }
    
    public static async removeMember(req: Request, res: Response): Promise<Response> { 
        const { id, userId } = req.params; 
        try { 
            await prisma.project.update({ 
                where: { id }, 
                data: { members: { disconnect: { id: userId } } } 
            }); 
            return res.status(204).send(); 
        } catch (error) { 
            return res.status(500).json({ error: 'Erro.' }); 
        } 
    }
}

export default ProjectsController;