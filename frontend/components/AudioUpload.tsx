'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, X, AlertCircle, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { audioJobService } from '@/lib/services/audioJob';
import type { AudioJob } from '@/lib/types/audio';

interface AudioUploadProps {
  onUploadSuccess?: (job: AudioJob) => void;
  onUploadError?: (error: string) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// More comprehensive list of audio MIME types and file extensions
const ALLOWED_TYPES = [
  'audio/mpeg', 'audio/mp3',           // MP3 files
  'audio/wav', 'audio/x-wav',          // WAV files  
  'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', // MP4/M4A files
  'audio/ogg', 'audio/opus',           // OGG files
  'audio/webm',                        // WebM audio
  'audio/flac',                        // FLAC files
  'audio/aiff', 'audio/x-aiff',        // AIFF files
  'audio/3gpp', 'audio/3gpp2'          // 3GP files
];

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.mp4', '.ogg', '.aac', '.flac', '.aiff', '.3gp'];

interface ProcessingOptions {
  analysisType: 'comprehensive' | 'meeting';
  summaryType: 'executive' | 'detailed' | 'bullet_points';
  processImmediately: boolean;
}

function AudioUpload({ onUploadSuccess, onUploadError }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    analysisType: 'comprehensive',
    summaryType: 'executive',
    processImmediately: true
  });

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`;
    }
    
    // Check both MIME type and file extension for better compatibility
    const isValidMimeType = ALLOWED_TYPES.includes(file.type);
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension);
    
    // Also check if it's a general audio type
    const isAudioType = file.type.startsWith('audio/');
    
    if (!isValidMimeType && !isValidExtension && !isAudioType) {
      return `File type not supported. Please upload audio files like: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, [onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ALLOWED_EXTENSIONS
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE
  });

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let response;
      
      if (options.processImmediately) {
       
        setUploadProgress(25);
        response = await audioJobService.processAudio(selectedFile, {
          analysisType: options.analysisType,
          summaryType: options.summaryType
        });
        setUploadProgress(100);
      } else {
        // Just upload without processing
        setUploadProgress(50);
        response = await audioJobService.uploadAudio(selectedFile);
        setUploadProgress(100);
      }
      
      if (response.success && response.data) {
        onUploadSuccess?.(response.data);
      
        setSelectedFile(null);
        setUploadProgress(0);
        setShowOptions(false);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Upload Area */}
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${selectedFile ? 'border-green-500 bg-green-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            {selectedFile ? (
              <FileAudio className="mx-auto h-12 w-12 text-green-600" />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            
            <div>
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-700">
                    File Selected
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                  <p className="text-xs text-gray-500">
                    Type: {selectedFile.type || 'Unknown'}
                  </p>
                </div>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-blue-600">
                  Drop the audio file here...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drag & drop an audio file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: {ALLOWED_EXTENSIONS.join(', ')} up to {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Options */}
      {selectedFile && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Processing Options</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showOptions ? 'Hide Options' : 'Show Options'}
              </Button>
            </div>

            {showOptions && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Type
                  </label>
                  <select
                    value={options.analysisType}
                    onChange={(e) => setOptions({...options, analysisType: e.target.value as 'comprehensive' | 'meeting'})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="meeting">Meeting Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Type
                  </label>
                  <select
                    value={options.summaryType}
                    onChange={(e) => setOptions({...options, summaryType: e.target.value as 'executive' | 'detailed' | 'bullet_points'})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="executive">Executive Summary</option>
                    <option value="detailed">Detailed Summary</option>
                    <option value="bullet_points">Bullet Points</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="processImmediately"
                    checked={options.processImmediately}
                    onChange={(e) => setOptions({...options, processImmediately: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="processImmediately" className="ml-2 block text-sm text-gray-700">
                    Start processing immediately
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={removeFile}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove File
              </Button>

              <div className="flex space-x-2">
                <Button
                  onClick={uploadFile}
                  disabled={uploading}
                  className="flex items-center"
                >
                  {options.processImmediately ? (
                    <Zap className="h-4 w-4 mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading 
                    ? `${options.processImmediately ? 'Processing' : 'Uploading'}... ${uploadProgress}%`
                    : options.processImmediately 
                      ? 'Upload & Process' 
                      : 'Upload Only'
                  }
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{options.processImmediately ? 'Processing' : 'Uploading'} {selectedFile?.name}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Default export for the component
export default AudioUpload;
