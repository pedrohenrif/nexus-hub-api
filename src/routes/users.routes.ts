import { Router } from 'express';
import UsersController from '@controllers/users.controller';

const router = Router();

router.get('/', UsersController.listUsers);
router.delete('/:id', UsersController.deleteUser);
router.put('/:id', UsersController.updateUser);

export default router;