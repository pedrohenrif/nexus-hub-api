import { Router } from 'express';
import InfraManagerController from '@controllers/infraManager.controller';

const router = Router();

// Servidores
router.get('/servers', InfraManagerController.listServers);
router.post('/servers', InfraManagerController.createServer);
router.put('/servers/:id', InfraManagerController.updateServer);
router.delete('/servers/:id', InfraManagerController.deleteServer);

// Ambientes
router.post('/environments', InfraManagerController.createEnvironment);
router.put('/environments/:id', InfraManagerController.updateEnvironment);
router.delete('/environments/:id', InfraManagerController.deleteEnvironment);

export default router;