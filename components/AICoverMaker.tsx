
import React, { useState, useEffect } from 'react';
import { generateAICover } from '../services/apiService';

interface AICoverMakerProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const SUBJECTS = ["Mountains", "Fields", "Roads", "Valley", "Water"];
const TIMES = ["Morning", "Afternoon", "Sunset", "Night"];
const STYLES = ["Cinematic", "Photography", "Minimalist"];

const THEME_MAP: Record<string, string> = {
  "Mountains": "majestic mountain ridges, rolling hills, highland peaks",
  "Fields": "vibrant green agricultural fields, terraced rows, lush vegetation",
  "Roads": "winding asphalt highland roads, pine tree lined streets, scenic paths",
  "Valley": "vast valley vistas, stobosa-style hillside houses, community landscapes",
  "Water": "mountain streams, misty waterfalls, dew-covered leaves"
};

const TIME_MAP: Record<string, string> = {
  "Morning": "soft blue morning light, rising sun, morning dew, hazy atmosphere",
  "Afternoon": "bright direct sunlight, clear blue skies, sharp shadows, vibrant colors",
  "Sunset": "golden hour glow, deep orange and purple sky, long shadows, dramatic lighting",
  "Night": "cool dark blue tones, starry night sky, distant glowing lights, moonlight"
};

const STYLE_MAP: Record<string, string> = {
  "Cinematic": "cinematic wide-angle shot, dramatic lighting, movie still quality",
  "Photography": "professional travel photography, natural realistic look, high resolution",
  "Minimalist": "minimalist composition, clean lines, plenty of negative space, simple beauty"
};

const AICoverMaker: React.FC<AICoverMakerProps> = ({ onSelect, onClose }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [time, setTime] = useState(TIMES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const subjectDesc = THEME_MAP[subject] || subject;
      const timeDesc = TIME_MAP[time] || time;
      const styleDesc = STYLE_MAP[style] || style;

      const prompt = `${styleDesc} of ${subjectDesc} during ${timeDesc}. High quality, cinematic, professional photography, sharp render, no text, no people, no faces, clean composition, 16:9 aspect ratio, 1280x720 resolution.`;

      const imageUrl = await generateAICover(prompt);
      setPreviewImage(imageUrl);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Left Side: Controls */}
        <div className="w-full md:w-1/3 p-6 md:p-8 bg-slate-50 border-r border-slate-100 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-magic text-lt-orange"></i> AI Cover Maker
            </h3>
            <button onClick={handleClose} className="md:hidden text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Subject</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      subject === s 
                        ? 'bg-lt-orange text-white shadow-md shadow-lt-orange/20' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-lt-orange'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Time of Day</label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      time === t 
                        ? 'bg-lt-blue text-white shadow-md shadow-lt-blue/20' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-lt-blue'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visual Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      style === s 
                        ? 'bg-lt-moss text-white shadow-md shadow-lt-moss/20' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-lt-moss'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-lt-orange transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Painting...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-sparkles"></i>
                  Generate Cover
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                <i className="fas fa-exclamation-circle mr-1"></i> {error}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-grow bg-slate-200 relative min-h-[300px] md:min-h-0 flex items-center justify-center overflow-hidden p-4 md:p-8">
          {previewImage ? (
            <div className="w-full max-w-2xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500 group">
              <img src={previewImage} alt="AI Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-6 left-6 right-6 flex gap-3 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => onSelect(previewImage)}
                  className="flex-grow py-3 bg-white text-slate-900 rounded-xl font-bold shadow-2xl hover:bg-lt-orange hover:text-white transition-all"
                >
                  Use This Cover
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white/40 transition-all"
                  title="Discard"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 animate-in fade-in duration-500">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-slate-300 border-t-lt-orange rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Vertex AI is imagining your cover...</p>
                </div>
              ) : (
                <div className="space-y-4 text-slate-400">
                  <i className="fas fa-image text-6xl opacity-20"></i>
                  <p className="max-w-xs mx-auto text-sm">Select your theme and click generate to create a custom cover photo for your blog.</p>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleClose} 
            className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full hidden md:flex items-center justify-center hover:bg-black/40 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoverMaker;
