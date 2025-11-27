import { Router } from 'express';
import TimelineController from '@controllers/timeline.controller';

const router = Router();

router.get('/global', TimelineController.getGlobalTimeline);

router.post('/', TimelineController.createPhase);
router.put('/:id', TimelineController.updatePhase);
router.delete('/:id', TimelineController.deletePhase);

export default router;