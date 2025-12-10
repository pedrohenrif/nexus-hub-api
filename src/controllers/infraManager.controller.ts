import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 
import { encrypt, decrypt } from '@utils/encryption';

class InfraManagerController {
    
    // --- SERVIDORES ---

    public static async listServers(req: Request, res: Response): Promise<Response> {
        try {
            const servers = await prisma.server.findMany({
                include: { 
                    environments: { 
                        include: { 
                            // Inclui projetos vinculados para exibir nos cards
                            projects: { 
                                select: { id: true, title: true, client: { select: { name: true } } } 
                            } 
                        } 
                    } 
                },
                orderBy: { name: 'asc' }
            });

            const decryptedServers = servers.map(server => ({
                ...server,
                password: decrypt(server.password),
                environments: server.environments.map(env => ({
                    ...env,
                    accessPassword: env.accessPassword ? decrypt(env.accessPassword) : null
                }))
            }));

            return res.status(200).json(decryptedServers);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar servidores.' });
        }
    }

    // Adicionado: Função que faltava para abrir os detalhes do servidor
    public static async getServerById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const server = await prisma.server.findUnique({
                where: { id },
                include: { 
                    environments: { 
                        include: { 
                            projects: { 
                                select: { id: true, title: true, client: { select: { name: true } } } 
                            } 
                        } 
                    } 
                }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            const decryptedServer = {
                ...server,
                password: decrypt(server.password),
                environments: server.environments.map(env => ({
                    ...env,
                    accessPassword: env.accessPassword ? decrypt(env.accessPassword) : null
                }))
            };

            return res.status(200).json(decryptedServer);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar servidor.' });
        }
    }

    public static async createServer(req: Request, res: Response): Promise<Response> {
        const { name, ipAddress, username, password, notes } = req.body;
        
        if (!name || !ipAddress) return res.status(400).json({ error: 'Nome e IP são obrigatórios.' });

        try {
            const newServer = await prisma.server.create({
                data: { name, ipAddress, username, password: encrypt(password), notes }
            });
            return res.status(201).json({ ...newServer, password: password }); 
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar servidor.' });
        }
    }

    public static async updateServer(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, ipAddress, username, password, notes } = req.body;

        try {
            const updated = await prisma.server.update({
                where: { id },
                data: { name, ipAddress, username, password: encrypt(password), notes }
            });
            return res.status(200).json({ ...updated, password: password });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar servidor.' });
        }
    }

    public static async deleteServer(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.server.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir servidor.' });
        }
    }

    // --- AMBIENTES (ATUALIZADO COM TODOS OS CAMPOS) ---

    public static async createEnvironment(req: Request, res: Response): Promise<Response> {
        const { 
            serverId, name, accessType, accessId, accessPassword, hasFixedIp, notes,
            isActive, isOnPremise, vCPU, ram, storage, os, projectIds // <--- Campos novos
        } = req.body;

        if (!serverId || !name || !accessType) {
            return res.status(400).json({ error: 'ID do Servidor, Nome e Tipo de Acesso são obrigatórios.' });
        }

        try {
            const newEnv = await prisma.serverEnvironment.create({
                data: { 
                    serverId, 
                    name, 
                    accessType, 
                    accessId, 
                    accessPassword: accessPassword ? encrypt(accessPassword) : null,
                    hasFixedIp: Boolean(hasFixedIp), 
                    notes,
                    // Campos de Infra detalhada
                    isActive: isActive !== undefined ? Boolean(isActive) : true,
                    isOnPremise: Boolean(isOnPremise),
                    vCPU, 
                    ram, 
                    storage, 
                    os,
                    // Vínculo com Projetos
                    projects: {
                        connect: projectIds ? projectIds.map((pid: string) => ({ id: pid })) : []
                    }
                }
            });
            return res.status(201).json({ ...newEnv, accessPassword });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao adicionar ambiente.' });
        }
    }

    public static async updateEnvironment(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { 
            name, accessType, accessId, accessPassword, hasFixedIp, notes,
            isActive, isOnPremise, vCPU, ram, storage, os, projectIds
        } = req.body;

        try {
            const updatedEnv = await prisma.serverEnvironment.update({
                where: { id },
                data: { 
                    name, 
                    accessType, 
                    accessId, 
                    accessPassword: accessPassword ? encrypt(accessPassword) : null,
                    hasFixedIp: Boolean(hasFixedIp), 
                    notes,
                    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                    isOnPremise: Boolean(isOnPremise),
                    vCPU, 
                    ram, 
                    storage, 
                    os,
                    // Atualiza a lista de projetos vinculados
                    projects: projectIds ? {
                        set: projectIds.map((pid: string) => ({ id: pid }))
                    } : undefined
                }
            });
            return res.status(200).json({ ...updatedEnv, accessPassword });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar ambiente.' });
        }
    }

    public static async deleteEnvironment(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.serverEnvironment.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover ambiente.' });
        }
    }
}

export default InfraManagerController;