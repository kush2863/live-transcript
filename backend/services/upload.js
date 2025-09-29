import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // More comprehensive list of audio MIME types
  const allowedMimes = [
    'audio/mpeg', 'audio/mp3',           // MP3 files
    'audio/wav', 'audio/x-wav',          // WAV files  
    'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', // MP4/M4A files
    'audio/ogg', 'audio/opus',           // OGG files
    'audio/webm',                        // WebM audio
    'audio/flac',                        // FLAC files
    'audio/aiff', 'audio/x-aiff',        // AIFF files
    'audio/3gpp', 'audio/3gpp2',         // 3GP files
    'application/octet-stream'           // Fallback for binary files
  ];
  
  // Common audio file extensions
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.aac', '.ogg', '.flac', '.aiff', '.3gp'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Check if the file is an audio file (by MIME type, general audio type, or extension)
  const isAudioMime = allowedMimes.includes(file.mimetype);
  const isGeneralAudio = file.mimetype.startsWith('audio/');
  const hasAudioExtension = allowedExtensions.includes(fileExtension);
  
  console.log(`File validation - Name: ${file.originalname}, MIME: ${file.mimetype}, Extension: ${fileExtension}`);
  
  if (isAudioMime || isGeneralAudio || hasAudioExtension) {
    cb(null, true);
  } else {
    console.log(`File rejected - MIME: ${file.mimetype}, Extension: ${fileExtension}`);
    cb(new Error(`Only audio files are allowed. Received: ${file.mimetype} with extension ${fileExtension}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

export const validateAudioFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No audio file uploaded'
    });
  }
  next();
};