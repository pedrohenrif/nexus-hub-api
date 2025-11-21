import { Router } from 'express';
import projectRoutes from './projects.routes';
import clientRoutes from './clients.routes';
import moduleRoutes from './modules.routes';
import infraRoutes from './infra.routes';
import authRoutes from './auth.routes'; 
import userRoutes from './users.routes'; 
import { authMiddleware } from '../middleware/auth.middleware'; 

const router = Router();

router.use('/auth', authRoutes);

router.use(authMiddleware);

// --- ROTAS PRIVADAS ---
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/modules', moduleRoutes);
router.use('/infra', infraRoutes);
router.use('/users', userRoutes);

export default router;