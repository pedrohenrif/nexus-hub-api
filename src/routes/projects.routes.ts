import { Router } from 'express';
import ProjectsController from '@controllers/projects.controller';

const router = Router();

// CRUD de Projetos
router.get('/', ProjectsController.listProjects);
router.get('/:id', ProjectsController.getProjectById);
router.post('/', ProjectsController.createProject);
router.put('/:id', ProjectsController.updateProject);
router.delete('/:id', ProjectsController.deleteProject);

// Rotas de Membros (NOVO)
router.post('/:id/members', ProjectsController.addMember);
router.delete('/:id/members/:userId', ProjectsController.removeMember);

export default router;