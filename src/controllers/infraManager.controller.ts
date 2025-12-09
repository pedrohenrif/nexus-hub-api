import { Request, Response } from 'express';
import prisma from '@services/prisma.service'; 
import { encrypt, decrypt } from '@utils/encryption'; // Importação do utilitário de criptografia

class InfraManagerController {
    
    // --- SERVIDORES ---

    // GET /api/infra-manager/servers
    public static async listServers(req: Request, res: Response): Promise<Response> {
        try {
            const servers = await prisma.server.findMany({
                include: { environments: true },
                orderBy: { name: 'asc' }
            });

            // Descriptografa as senhas antes de enviar para o front
            // Assim o usuário consegue visualizar/copiar a senha real
            const decryptedServers = servers.map(server => ({
                ...server,
                password: decrypt(server.password), // Descriptografa senha do servidor
                environments: server.environments.map(env => ({
                    ...env,
                    accessPassword: env.accessPassword ? decrypt(env.accessPassword) : null // Descriptografa senha do ambiente
                }))
            }));

            return res.status(200).json(decryptedServers);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar servidores.' });
        }
    }

    public static async getServerById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const server = await prisma.server.findUnique({
                where: { id },
                include: { environments: true }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            // Descriptografa
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

    // POST /api/infra-manager/servers
    public static async createServer(req: Request, res: Response): Promise<Response> {
        const { name, ipAddress, username, password, notes } = req.body;
        
        if (!name || !ipAddress) return res.status(400).json({ error: 'Nome e IP são obrigatórios.' });

        try {
            const newServer = await prisma.server.create({
                data: { 
                    name, 
                    ipAddress, 
                    username, 
                    password: encrypt(password), // <--- Criptografa ao salvar
                    notes 
                }
            });
            // Retorna o objeto com a senha original (ou descriptografada) para a UI não quebrar
            return res.status(201).json({ ...newServer, password: password }); 
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar servidor.' });
        }
    }

    // PUT /api/infra-manager/servers/:id
    public static async updateServer(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, ipAddress, username, password, notes } = req.body;

        try {
            const updated = await prisma.server.update({
                where: { id },
                data: { 
                    name, 
                    ipAddress, 
                    username, 
                    password: encrypt(password), // <--- Criptografa novamente ao atualizar
                    notes 
                }
            });
            return res.status(200).json({ ...updated, password: password });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar servidor.' });
        }
    }

    // DELETE /api/infra-manager/servers/:id
    public static async deleteServer(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.server.delete({ where: { id } });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir servidor.' });
        }
    }

    // --- AMBIENTES ---

    // POST /api/infra-manager/environments
    public static async createEnvironment(req: Request, res: Response): Promise<Response> {
        const { serverId, name, accessType, accessId, accessPassword, hasFixedIp, notes } = req.body;

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
                    accessPassword: accessPassword ? encrypt(accessPassword) : null, // <--- Criptografa
                    hasFixedIp: Boolean(hasFixedIp), 
                    notes 
                }
            });
            return res.status(201).json({ ...newEnv, accessPassword });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao adicionar ambiente.' });
        }
    }

    // PUT /api/infra-manager/environments/:id
    public static async updateEnvironment(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, accessType, accessId, accessPassword, hasFixedIp, notes } = req.body;

        try {
            const updatedEnv = await prisma.serverEnvironment.update({
                where: { id },
                data: { 
                    name, 
                    accessType, 
                    accessId, 
                    accessPassword: accessPassword ? encrypt(accessPassword) : null, // <--- Criptografa
                    hasFixedIp: Boolean(hasFixedIp), 
                    notes 
                }
            });
            return res.status(200).json({ ...updatedEnv, accessPassword });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar ambiente.' });
        }
    }

    // DELETE /api/infra-manager/environments/:id
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