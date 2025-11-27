import { Router } from 'express';
import ModulesController from '@controllers/modules.controller';

const router = Router();

router.post('/', ModulesController.createModule);
router.delete('/:id', ModulesController.deleteModule);
router.put('/:id', ModulesController.updateModule);

export default router;