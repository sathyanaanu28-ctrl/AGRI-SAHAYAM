import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Clock, 
  Leaf, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DiseaseDetection, SeverityLevel } from '../types';
import { SAMPLE_LEAVES, SampleLeaf } from '../data/sampleLeaves';

interface DiseaseDetectionProps {
  userId: string;
  autoStartCamera?: boolean;
}

export const DiseaseDetectionComponent: React.FC<DiseaseDetectionProps> = ({ userId, autoStartCamera }) => {
  const { language, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiseaseDetection | null>(null);
  const [history, setHistory] = useState<DiseaseDetection[]>([]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`agrisahay_disease_history_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to parse diagnosis history:', e);
      }
    }
  }, [userId]);

  // Clean up media and audio on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Listen for auto-start or agrisahay-open-camera event
  useEffect(() => {
    if (autoStartCamera) {
      startCamera();
    }
  }, [autoStartCamera]);

  useEffect(() => {
    const handler = () => {
      startCamera();
    };
    window.addEventListener('agrisahay-open-camera', handler);
    return () => window.removeEventListener('agrisahay-open-camera', handler);
  }, []);

  const saveToHistory = (item: DiseaseDetection) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)];
    setHistory(updated);
    localStorage.setItem(`agrisahay_disease_history_${userId}`, JSON.stringify(updated));
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(`agrisahay_disease_history_${userId}`, JSON.stringify(updated));
    if (currentDiagnosis?.id === id) {
      setCurrentDiagnosis(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setCurrentDiagnosis(null);
    };
    reader.readAsDataURL(file);
  };

  // Convert SVG data URL to raster PNG for Gemini compatibility
  const rasterizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Rasterization notice:', e);
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleSelectSample = (sample: SampleLeaf) => {
    stopCamera();
    setSelectedFile(null);
    setImagePreview(sample.dataUrl);
    setMimeType('image/jpeg');
    setErrorMessage(null);
    setCurrentDiagnosis(null);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMessage('Unable to access camera. Please check camera permissions in your browser or upload an image.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setMimeType('image/jpeg');
      setSelectedFile(null);
      stopCamera();
      setCurrentDiagnosis(null);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!imagePreview) return;

    setIsDiagnosing(true);
    setErrorMessage(null);
    stopAudio();

    try {
      let finalData = imagePreview;
      let targetMime = mimeType || 'image/jpeg';

      if (finalData.includes('image/svg') || finalData.includes('<svg') || targetMime.includes('svg')) {
        finalData = await rasterizeImage(finalData);
        targetMime = 'image/png';
        setImagePreview(finalData);
      }

      let base64String = finalData.includes(',') ? finalData.split(',')[1] : finalData;

      // Make the call to the backend API endpoint
      const response = await fetch('/api/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: targetMime,
          languageCode: language.code
        })
      });

      if (!response.ok) {
        let errJson: any;
        try {
          errJson = await response.json();
        } catch {
          // If response body is not JSON, provide controlled friendly message
          throw new Error('AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.');
        }
        throw new Error(errJson?.error || 'AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.');
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error('AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.');
      }

      // Construct verified diagnosis record
      const fullDiagnosis: DiseaseDetection = {
        ...data,
        id: 'diag_' + Date.now(),
        userId,
        imageUrl: imagePreview,
        createdAt: new Date().toISOString()
      };

      setCurrentDiagnosis(fullDiagnosis);
      saveToHistory(fullDiagnosis);
    } catch (err: any) {
      // Safe error display: do NOT expose raw Unexpected token exception or API keys
      const msg = err?.message || 'AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.';
      setErrorMessage(msg);
      // Requirement: Keep image visible, keep button usable, do not save invalid response
    } finally {
      setIsDiagnosing(false);
    }
  };

  const resetDetection = () => {
    stopCamera();
    stopAudio();
    setSelectedFile(null);
    setImagePreview(null);
    setCurrentDiagnosis(null);
    setErrorMessage(null);
  };

  const toggleAudio = () => {
    if (!currentDiagnosis) return;
    if (isAudioPlaying) {
      stopAudio();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    const remedies = currentDiagnosis.organicRemedies?.join('. ') || '';
    const preventions = currentDiagnosis.preventativeMeasures?.join('. ') || '';
    const script = `${currentDiagnosis.diseaseName}. ${currentDiagnosis.severity} severity. Remedies: ${remedies}. Prevention: ${preventions}`;

    const utterance = new SpeechSynthesisUtterance(script);
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      pa: 'pa-IN'
    };
    utterance.lang = langMap[language.code] || 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioPlaying(false);
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-100 border border-white/20 mb-3 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>AI Pathology & Organic Prescription</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('diseaseDetection') || 'Crop Disease Diagnostics'}
          </h2>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed font-normal">
            Upload an image of an infected leaf, stem, or fruit to receive instant pathogen identification, severity scoring, and 100% organic, locally prepared bio-remedies.
          </p>
        </div>
      </div>

      {/* Main Diagnosis Result Card (if diagnosed) */}
      {currentDiagnosis ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left: Image Container with Zoom */}
            <div className="relative shrink-0 w-full lg:w-72 h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img
                src={currentDiagnosis.imageUrl}
                alt={currentDiagnosis.diseaseName}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors cursor-pointer"
                title={isZoomed ? 'Zoom out' : 'Magnify leaf pathology'}
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>
              <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-200">
                {new Date(currentDiagnosis.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Right: Pathological Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {currentDiagnosis.type}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(currentDiagnosis.severity)}`}>
                      {currentDiagnosis.severity} {t('severity') || 'Severity'}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {currentDiagnosis.diseaseName}
                  </h3>
                  {currentDiagnosis.scientificName && (
                    <p className="text-xs italic text-slate-500 mt-0.5">
                      {currentDiagnosis.scientificName}
                    </p>
                  )}
                </div>

                {/* Action Buttons: Print, Audio Speech */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Print Diagnostic Prescription Slip"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isAudioPlaying
                        ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                    title="Listen to diagnosis aloud"
                  >
                    {isAudioPlaying ? (
                      <>
                        <VolumeX className="h-4 w-4" />
                        <span>{t('stopAudio') || 'Stop Audio'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 text-emerald-700" />
                        <span>{t('listenAudio') || 'Listen to Advisory'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Confidence & Category Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('confidence') || 'Confidence Score'}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(10, currentDiagnosis.confidenceScore))}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-emerald-800">
                      {currentDiagnosis.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('category') || 'Diagnosis Category'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {currentDiagnosis.type}
                  </span>
                </div>

                {currentDiagnosis.pathogenType && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pathogen
                    </span>
                    <span className="text-xs font-bold text-amber-800 mt-1 block truncate">
                      {currentDiagnosis.pathogenType}
                    </span>
                  </div>
                )}
              </div>

              {/* Symptoms Observed */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t('symptoms') || 'Observed Symptoms'}</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {currentDiagnosis.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-black">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Organic Remedies & Preventative Measures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Organic Remedies */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <Leaf className="h-5 w-5 text-emerald-700" />
                <h4 className="text-sm font-extrabold tracking-tight">
                  {t('organicRemedies') || 'Organic Treatments & Bio-Remedies'}
                </h4>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                Zero chemical toxicity remedies using farm-derived biological inoculants.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-800">
                {currentDiagnosis.organicRemedies.map((remedy, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventative Measures */}
            <div className="bg-sky-50/60 border border-sky-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-900">
                <ShieldCheck className="h-5 w-5 text-sky-700" />
                <h4 className="text-sm font-extrabold tracking-tight">
                  {t('preventativeMeasures') || 'Preventative Cultural Practices'}
                </h4>
              </div>
              <p className="text-[11px] text-sky-800/80">
                Agronomic field management to eliminate recurrence and protect neighbouring rows.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-800">
                {currentDiagnosis.preventativeMeasures.map((measure, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Spray Schedule (if provided) */}
          {currentDiagnosis.spraySchedule && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">
                  {t('spraySchedule') || 'Recommended Bio-Spray Schedule'}
                </span>
                <span className="text-amber-900/90">{currentDiagnosis.spraySchedule}</span>
              </div>
            </div>
          )}

          {/* Bottom Bar: Scan another */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Diagnosis saved to your Farm Records.
            </span>
            <button
              onClick={resetDetection}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('scanAnother') || 'Scan Another Plant'}</span>
            </button>
          </div>

        </div>
      ) : (
        /* Image Upload & Camera Capture Section */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          
          {/* Active Camera View */}
          {isCameraActive ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-black aspect-[4/3]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/50 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-slate-900/80 text-emerald-300 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Center leaf within frame
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={captureCameraPhoto}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : imagePreview ? (
            /* Uploaded Image Preview & Action Button */
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
                <img src={imagePreview} alt="Crop preview" className="w-full h-72 object-cover" />
                {!isDiagnosing && (
                  <button
                    onClick={resetDetection}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                  >
                    {t('changeImage') || 'Change Image'}
                  </button>
                )}
              </div>

              {/* Diagnosis Action Button */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRunDiagnosis}
                  disabled={isDiagnosing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 cursor-pointer"
                >
                  {isDiagnosing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('diagnosing') || 'Diagnosing Crop Health...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-200" />
                      <span>{t('runDiagnosis') || 'Run AI Diagnosis'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Upload Pickers */
            <div className="space-y-6">
              
              {/* Instructions banner */}
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Upload a crop or leaf photo
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  AI will analyze the image and identify possible diseases, pests, or nutrient deficiencies with 100% organic biological treatments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Upload from file */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl p-8 cursor-pointer transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform mb-3 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                    {t('uploadPrompt') || 'Click or drag & drop leaf photo'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {t('supportsFormats') || 'Supports JPG, PNG, WEBP (Max 15MB)'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* Camera snap */}
                <div
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 cursor-pointer transition-all group"
                >
                  <div className="h-14 w-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform mb-3 shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-teal-800 transition-colors">
                    Use Field Camera
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Snap a leaf photo directly in real-time
                  </span>
                </div>

              </div>

              {/* Sample Leaves for instant testing */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('useSample') || 'Or try a sample leaf image:'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SAMPLE_LEAVES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="group flex flex-col items-start p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white text-left transition-all hover:shadow-md active:scale-95 cursor-pointer"
                    >
                      <img
                        src={sample.dataUrl}
                        alt={sample.name}
                        className="w-full h-24 object-cover rounded-xl border border-slate-100 mb-2 group-hover:border-emerald-300 transition-colors"
                      />
                      <span className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700">
                        {sample.name}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {sample.crop.split('(')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Controlled Friendly Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Diagnosis Request Notice</span>
                <span className="text-xs text-red-700 leading-relaxed block mt-0.5">
                  {errorMessage}
                </span>
                <p className="text-[11px] text-red-600/90 mt-1">
                  You can retry by pressing "Run AI Diagnosis" above or selecting another leaf photo.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Diagnosis History Log */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">
              {t('historyTitle') || 'Diagnosis History'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({history.length})
            </span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center border border-slate-200 rounded-3xl bg-slate-50 text-slate-500 text-sm">
            {t('noHistory') || 'No crop diagnoses recorded yet. Upload a leaf photo above.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  stopAudio();
                  setCurrentDiagnosis(item);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className={`group relative cursor-pointer border rounded-2xl p-4 space-y-3 transition-all bg-white hover:shadow-md ${
                  currentDiagnosis?.id === item.id
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div className="relative overflow-hidden rounded-xl border border-slate-100 aspect-video bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.diseaseName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-emerald-400 backdrop-blur-xs border border-white/10">
                    {item.confidenceScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                      {item.diseaseName}
                    </h4>
                    <button
                      onClick={(e) => removeFromHistory(item.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className={`font-bold ${
                      item.severity === 'High' ? 'text-red-600' : item.severity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
