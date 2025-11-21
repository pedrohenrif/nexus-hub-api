import { Router } from 'express';
import InfraController from '@controllers/infra.controller';

const router = Router();

router.post('/', InfraController.createItem);
router.delete('/:id', InfraController.deleteItem);

export default router;