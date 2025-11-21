import { Router } from 'express';
import ProjectsController from '@controllers/projects.controller';

const router = Router();

router.get('/', ProjectsController.listProjects);
router.get('/:id', ProjectsController.getProjectById);
router.post('/', ProjectsController.createProject);
router.put('/:id', ProjectsController.updateProject);
router.delete('/:id', ProjectsController.deleteProject);

export default router;