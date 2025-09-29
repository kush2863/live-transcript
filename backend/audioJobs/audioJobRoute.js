import express from 'express';
import { AudioJobController } from './audioJobController.js';
import { authenticateUser } from '../middleware/auth.js';
import { upload, validateAudioFile } from '../services/upload.js';

const router = express.Router();
const audioJobController = new AudioJobController();

// All routes require authentication
router.use(authenticateUser);

// Upload audio file and create job
router.post('/upload', upload.single('audio'), validateAudioFile, audioJobController.uploadAndCreateJob);

// Process audio file (upload + immediate processing)
router.post('/process-audio', upload.single('audio'), validateAudioFile, audioJobController.processAudio);

// Create new audio job (manual creation)
router.post('/jobs', audioJobController.createJob);

// Get user's audio jobs
router.get('/jobs', audioJobController.getUserJobs);

// Get specific job by ID
router.get('/jobs/:id', audioJobController.getJobById);

// Get processing status for a job
router.get('/jobs/:id/status', audioJobController.getProcessingStatus);

// Update job status
router.patch('/jobs/:id', audioJobController.updateJob);

// Start processing job
router.post('/jobs/:id/process', audioJobController.startProcessing);

export default router;
