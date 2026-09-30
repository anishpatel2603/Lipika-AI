import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Share2,
  Volume2,
  VolumeX,
  FileText,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Eye,
  ScanText,
  FlipHorizontal,
  X,
  Pencil,
} from 'lucide-react';
import { ocrExtract, transliterateText, generateTTS } from '../services/api.js';
import { preprocessImage, PreprocessOptions } from '../services/imageProcessor.js';
import { runClientOcr } from '../services/clientOcr.js';
import { copyToClipboard, downloadAsTxt, downloadAsPdf, shareResult } from '../utils/export.js';
import { saveHistoryItem } from '../utils/storage.js';
import { generateSampleSignboard } from '../utils/sampleImages.js';

export const CameraWorkspace: React.FC = () => {
  // Mode: 'camera' | 'upload' | 'demo'
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('upload');

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Image data state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<'original' | 'processed'>('original');

  // Preprocessing controls
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<PreprocessOptions>({
    grayscale: true,
    contrast: 30,
    brightness: 10,
    threshold: -1,
  });

  // OCR state
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState('Reading the image...');
  const [detectedText, setDetectedText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  // Transliteration result state
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [transliteratedText, setTransliteratedText] = useState('');
  const [transliterationConfidence, setTransliterationConfidence] = useState<number | null>(null);

  // Utility states
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    setCameraError(null);
    setErrorMessage(null);
    const targetFacing = overrideFacing || facingMode;

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Camera permission was denied or camera is unavailable. You can upload an image instead.'
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    handleSetImage(dataUrl);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit. Please upload a smaller photo.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleSetImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetImage = async (dataUrl: string) => {
    setRawImage(dataUrl);
    setDetectedText('');
    setTransliteratedText('');
    setOcrConfidence(null);
    setTransliterationConfidence(null);

    // Run preprocessing for preview
    const processed = await preprocessImage(dataUrl, filterOptions);
    setProcessedImage(processed);

    // Trigger OCR automatically
    runOcrPipeline(dataUrl, processed);
  };

  const handlePreprocessChange = async (newOptions: PreprocessOptions) => {
    setFilterOptions(newOptions);
    if (rawImage) {
      const processed = await preprocessImage(rawImage, newOptions);
      setProcessedImage(processed);
    }
  };

  const runOcrPipeline = async (original: string, processed: string) => {
    setIsOcrProcessing(true);
    setOcrProgressText('Reading the image...');
    setErrorMessage(null);

    // Prefer processed image for OCR clarity
    const imageToScan = processed || original;

    try {
      setOcrProgressText('Locating text & extracting characters...');
      let ocrRes = await ocrExtract(imageToScan);

      if (!ocrRes.success || !ocrRes.text) {
        // Fallback to client-side OCR (Tesseract.js)
        setOcrProgressText('Refining with secondary OCR engine...');
        ocrRes = await runClientOcr(imageToScan);
      }

      if (ocrRes.success && ocrRes.text) {
        setDetectedText(ocrRes.text);
        setOcrConfidence(ocrRes.confidence);

        // Run Transliteration automatically
        runTransliteration(ocrRes.text, ocrRes.confidence);
      } else {
        setErrorMessage("I couldn't detect readable text in this image. Try a clearer photo or a preset signboard.");
      }
    } catch (err: any) {
      console.warn('OCR error, trying client fallback:', err);
      try {
        const clientRes = await runClientOcr(imageToScan);
        if (clientRes.success && clientRes.text) {
          setDetectedText(clientRes.text);
          setOcrConfidence(clientRes.confidence);
          runTransliteration(clientRes.text, clientRes.confidence);
        } else {
          setErrorMessage("I couldn't detect readable text in this image. Try a clearer photo.");
        }
      } catch (clientErr) {
        setErrorMessage("I couldn't detect readable text in this image. Try a clearer photo.");
      }
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const runTransliteration = async (textToTransliterate: string, currentOcrConf?: number | null) => {
    if (!textToTransliterate.trim()) {
      setErrorMessage('Please ensure there is detected text to transliterate.');
      return;
    }

    setIsTransliterating(true);
    setErrorMessage(null);

    try {
      const res = await transliterateText(textToTransliterate, 'camera', { correctOcr: true });
      if (res.success) {
        setTransliteratedText(res.transliteration);
        setTransliterationConfidence(res.confidence);

        // Save to History
        saveHistoryItem({
          source: 'camera',
          originalText: textToTransliterate,
          transliteratedText: res.transliteration,
          confidence: res.confidence,
        });
      } else {
        setErrorMessage(res.error || 'Failed to transliterate text.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong while processing your request. Please try again.');
    } finally {
      setIsTransliterating(false);
    }
  };

  const handleLoadSample = (sampleType: 'mumbai' | 'csdept' | 'college' | 'traffic') => {
    stopCamera();
    const sampleDataUrl = generateSampleSignboard(sampleType);
    handleSetImage(sampleDataUrl);
  };

  const handleRetake = () => {
    setRawImage(null);
    setProcessedImage(null);
    setDetectedText('');
    setTransliteratedText('');
    setOcrConfidence(null);
    setTransliterationConfidence(null);
    setErrorMessage(null);
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  const handleCopy = async () => {
    if (!transliteratedText) return;
    const ok = await copyToClipboard(transliteratedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSpeak = async () => {
    if (!transliteratedText) return;

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    try {
      const audioUrl = await generateTTS(transliteratedText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsPlayingAudio(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => fallbackSpeak();
        await audio.play();
        return;
      }
    } catch (e) {
      // fallback
    }

    fallbackSpeak();
  };

  const fallbackSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transliteratedText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200/60">
          <ScanText className="w-3.5 h-3.5 text-amber-600" />
          <span>Multimodal OCR + Vision Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Camera & Image OCR Transliteration
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Point your camera at any signboard, poster, notice, or textbook. Lipika AI extracts English text and transliterates it into natural Hindi script.
        </p>
      </div>

      {/* Error Alert */}
      {(errorMessage || cameraError) && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage || cameraError}</p>
          </div>
          <button
            onClick={() => {
              setErrorMessage(null);
              setCameraError(null);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setActiveMode('upload');
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Upload Photo</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-600" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Demo Presets Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Try Demo Signboards:
          </span>
          <button
            onClick={() => handleLoadSample('mumbai')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Mumbai Signboard
          </button>
          <button
            onClick={() => handleLoadSample('csdept')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors"
          >
            Pillai Dept Notice
          </button>
          <button
            onClick={() => handleLoadSample('traffic')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            Smart Traffic Board
          </button>
        </div>
      </div>

      {/* Capture / Upload Area (when no image is captured yet) */}
      {!rawImage && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          {activeMode === 'camera' ? (
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              {/* Camera Video Viewport */}
              <div className="relative w-full aspect-[4/3] max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder crosshairs */}
                <div className="absolute inset-8 border-2 border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-white/70 text-xs font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                    Align text within viewfinder
                  </span>
                </div>

                {!isCameraActive && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-white font-semibold text-sm">Camera inactive</p>
                    <button
                      onClick={() => startCamera()}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Open Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              {isCameraActive && (
                <div className="mt-6 flex items-center justify-center gap-6">
                  <button
                    onClick={handleToggleFacingMode}
                    className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Switch camera (front/rear)"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Capture Photo"
                  >
                    <Camera className="w-7 h-7" />
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Cancel camera"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Drag and Drop Upload Viewport */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`max-w-2xl mx-auto p-10 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Drag and drop your image here
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Supports JPG, PNG, or WEBP up to 10MB. Ideal for signboards, notices, menus, and book pages.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
                <button
                  onClick={() => {
                    setActiveMode('camera');
                    startCamera();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Or Open Camera
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Loaded: Interactive OCR & Transliteration Workspace */}
      {rawImage && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Image Status:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Image Loaded
              </span>
              {ocrConfidence !== null && (
                <span className="text-xs font-medium text-slate-500">
                  OCR Accuracy: <strong>{Math.round(ocrConfidence * 100)}%</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  showFilters
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Image Preprocessing</span>
              </button>

              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Retake / Change Photo</span>
              </button>
            </div>
          </div>

          {/* Collapsible Preprocessing Controls */}
          {showFilters && (
            <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Pre-OCR Image Quality Filters
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  Improves character contrast on reflective or poorly lit signs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Contrast Boost: {filterOptions.contrast}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={filterOptions.contrast || 0}
                    onChange={(e) =>
                      handlePreprocessChange({ ...filterOptions, contrast: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Brightness: {filterOptions.brightness}%
                  </label>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    value={filterOptions.brightness || 0}
                    onChange={(e) =>
                      handlePreprocessChange({ ...filterOptions, brightness: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handlePreprocessChange({
                        ...filterOptions,
                        grayscale: !filterOptions.grayscale,
                      })
                    }
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      filterOptions.grayscale
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Grayscale: {filterOptions.grayscale ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => {
                      if (rawImage && processedImage) {
                        runOcrPipeline(rawImage, processedImage);
                      }
                    }}
                    className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Re-run OCR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Two-Column OCR Split View: Image on Left, Editable Text on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT: Image Preview (with Original / Processed toggle) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Captured Image
                </span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveImageTab('original')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                      activeImageTab === 'original'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setActiveImageTab('processed')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                      activeImageTab === 'processed'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Processed
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[500px] overflow-hidden">
                <img
                  src={activeImageTab === 'processed' && processedImage ? processedImage : rawImage}
                  alt="Captured text"
                  className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Displaying {activeImageTab} visual</span>
                <span>Ready for OCR extraction</span>
              </div>
            </div>

            {/* RIGHT: Detected Text (Editable textarea) & Transliterate Action */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[460px]">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanText className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Detected Text (Editable)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Review & correct OCR before transliterating
                </span>
              </div>

              <div className="flex-1 p-5 flex flex-col">
                {isOcrProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-10 h-10 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm font-bold text-slate-800">{ocrProgressText}</p>
                    <p className="text-xs text-slate-400 mt-1">Analyzing character geometries...</p>
                  </div>
                ) : (
                  <>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Pencil className="w-3 h-3 text-amber-600" />
                      Extracted Text:
                    </label>
                    <textarea
                      value={detectedText}
                      onChange={(e) => setDetectedText(e.target.value)}
                      placeholder="OCR detected text will appear here. You can manually tweak any mistyped words..."
                      className="w-full flex-1 resize-none border border-slate-200 rounded-xl p-3.5 text-slate-900 text-base font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      rows={8}
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      Tip: If OCR made a typo (e.g. "Welc0me" instead of "Welcome"), edit it above before transliteration.
                    </p>
                  </>
                )}
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {detectedText.trim() ? detectedText.trim().split(/\s+/).length : 0} words extracted
                </div>

                <button
                  onClick={() => runTransliteration(detectedText, ocrConfidence)}
                  disabled={isTransliterating || isOcrProcessing || !detectedText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
                >
                  {isTransliterating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transliterating...</span>
                    </>
                  ) : (
                    <>
                      <span>Transliterate Extracted Text</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* FINAL RESULT CARD: Devanagari Hindi Transliteration */}
          {transliteratedText && (
            <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-amber-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-devanagari font-bold flex items-center justify-center text-lg shadow-xs">
                    लि
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      AI Transliterated Output
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preserves phonetic pronunciation in natural Devanagari script
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {ocrConfidence !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      OCR: {Math.round(ocrConfidence * 100)}%
                    </span>
                  )}
                  {transliterationConfidence !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Transliteration: High ({Math.round(transliterationConfidence * 100)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Text display */}
              <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/80 mb-6">
                <p className="font-devanagari text-2xl sm:text-3xl font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {transliteratedText}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeak}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-4 h-4 text-amber-800 animate-pulse" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-amber-800" />
                        <span>Speak it</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => downloadAsTxt(detectedText, transliteratedText, 'camera')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>TXT</span>
                  </button>

                  <button
                    onClick={() => downloadAsPdf(detectedText, transliteratedText, transliterationConfidence || 0.95, 'camera')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => shareResult('Hindi Transliteration', `${detectedText}\n\n→\n\n${transliteratedText}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
