import { Router } from 'express';
import ClientsController from '@controllers/clients.controller';

const router = Router();

router.get('/', ClientsController.listClients);
router.post('/', ClientsController.createClient);
router.put('/:id', ClientsController.updateClient);
router.delete('/:id', ClientsController.deleteClient);

export default router;