import { Request, Response } from 'express';
import prisma from '@services/prisma.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_padrao_dev';

class AuthController {
    
    // LOGIN
    public static async login(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            
            if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

            // Verifica se o usuário está ativo
            if (user.status === 'PENDING') {
                return res.status(403).json({ error: 'Sua conta está aguardando aprovação do administrador.' });
            }
            if (user.status === 'BLOCKED') {
                return res.status(403).json({ error: 'Conta bloqueada.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Credenciais inválidas.' });

            // Gera Token
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

            return res.json({ 
                token, 
                user: { id: user.id, name: user.name, email: user.email, role: user.role } 
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno no login.' });
        }
    }

    // REGISTRO (SOLICITAR ACESSO)
    public static async register(req: Request, res: Response): Promise<Response> {
        const { name, email, password } = req.body;

        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(400).json({ error: 'Email já cadastrado.' });

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    status: 'PENDING', // Padrão: Pendente
                    role: 'USER'
                }
            });

            return res.status(201).json({ message: 'Solicitação enviada! Aguarde aprovação.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao registrar.' });
        }
    }

    // SOLICITAR TROCA DE SENHA
    public static async requestPasswordReset(req: Request, res: Response): Promise<Response> {
        const { email, newPassword } = req.body;
        
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { tempPassword: hashedNewPassword } // Salva no campo temporário
            });

            return res.json({ message: 'Nova senha solicitada. Aguarde aprovação.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao solicitar troca de senha.' });
        }
    }

    // --- ÁREA DO ADMIN (Aprovar Usuários/Senhas) ---
    
    // Endpoint Mágico para você aprovar usuários via Postman/Frontend Admin
    // PUT /api/auth/approve/:id
    public static async approveUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { action } = req.body; // 'ACTIVATE_USER' ou 'APPROVE_PASSWORD'

        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            if (action === 'ACTIVATE_USER') {
                await prisma.user.update({
                    where: { id },
                    data: { status: 'ACTIVE' }
                });
                return res.json({ message: `Usuário ${user.name} ativado com sucesso!` });
            }

            if (action === 'APPROVE_PASSWORD') {
                if (!user.tempPassword) return res.status(400).json({ error: 'Nenhuma troca de senha pendente.' });
                
                await prisma.user.update({
                    where: { id },
                    data: { 
                        password: user.tempPassword, // Aplica a nova senha
                        tempPassword: null // Limpa o temporário
                    }
                });
                return res.json({ message: `Senha de ${user.name} atualizada com sucesso!` });
            }

            return res.status(400).json({ error: 'Ação inválida.' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro na aprovação.' });
        }
    }
}

export default AuthController;