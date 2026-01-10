import { useState, useEffect } from "react";

/**
 * BlendShapeController Component
 * Visual control panel for testing and adjusting avatar blend shapes in real-time
 * Positioned on the right side of the screen
 */
export const BlendShapeController = ({ 
  onBlendShapeChange, 
  onVisemeSelect,
  isVisible = true 
}) => {
  // Viseme options (phoneme shapes)
  const visemeOptions = [
    { code: 'A', label: 'viseme_PP (P, B, M)', phoneme: 'PP' },
    { code: 'B', label: 'viseme_kk (K, G)', phoneme: 'kk' },
    { code: 'C', label: 'viseme_I (I, EE)', phoneme: 'I' },
    { code: 'D', label: 'viseme_AA (A, AH)', phoneme: 'AA' },
    { code: 'E', label: 'viseme_O (O, OH)', phoneme: 'O' },
    { code: 'F', label: 'viseme_U (U, OO)', phoneme: 'U' },
    { code: 'G', label: 'viseme_FF (F, V)', phoneme: 'FF' },
    { code: 'H', label: 'viseme_TH (TH)', phoneme: 'TH' },
    { code: 'X', label: 'Silence / Rest', phoneme: 'Silent' },
  ];

  // Common ARKit blend shapes
  const blendShapes = [
    // Jaw
    { name: 'jawOpen', label: 'Jaw Open', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'jawForward', label: 'Jaw Forward', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'jawLeft', label: 'Jaw Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'jawRight', label: 'Jaw Right', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Mouth
    { name: 'mouthOpen', label: 'Mouth Open', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthClose', label: 'Mouth Close', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthSmileLeft', label: 'Smile Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthSmileRight', label: 'Smile Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthFrownLeft', label: 'Frown Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthFrownRight', label: 'Frown Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthPucker', label: 'Mouth Pucker', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthFunnel', label: 'Mouth Funnel', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthLeft', label: 'Mouth Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthRight', label: 'Mouth Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthDimpleLeft', label: 'Dimple Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthDimpleRight', label: 'Dimple Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthStretchLeft', label: 'Stretch Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthStretchRight', label: 'Stretch Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthPressLeft', label: 'Press Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthPressRight', label: 'Press Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthRollLower', label: 'Roll Lower', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthRollUpper', label: 'Roll Upper', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthShrugLower', label: 'Shrug Lower', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'mouthShrugUpper', label: 'Shrug Upper', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Eyes
    { name: 'eyeBlinkLeft', label: 'Blink Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'eyeBlinkRight', label: 'Blink Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'eyeSquintLeft', label: 'Squint Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'eyeSquintRight', label: 'Squint Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'eyeWideLeft', label: 'Wide Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'eyeWideRight', label: 'Wide Right', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Brows
    { name: 'browDownLeft', label: 'Brow Down Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'browDownRight', label: 'Brow Down Right', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'browInnerUp', label: 'Brow Inner Up', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'browOuterUpLeft', label: 'Brow Outer Up Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'browOuterUpRight', label: 'Brow Outer Up Right', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Cheeks
    { name: 'cheekPuff', label: 'Cheek Puff', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'cheekSquintLeft', label: 'Cheek Squint Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'cheekSquintRight', label: 'Cheek Squint Right', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Nose
    { name: 'noseSneerLeft', label: 'Nose Sneer Left', min: 0, max: 1, step: 0.01, default: 0 },
    { name: 'noseSneerRight', label: 'Nose Sneer Right', min: 0, max: 1, step: 0.01, default: 0 },
    
    // Tongue
    { name: 'tongueOut', label: 'Tongue Out', min: 0, max: 1, step: 0.01, default: 0 },
  ];

  const [selectedViseme, setSelectedViseme] = useState('X');
  const [blendShapeValues, setBlendShapeValues] = useState(() => {
    const initial = {};
    blendShapes.forEach(shape => {
      initial[shape.name] = shape.default;
    });
    return initial;
  });

  const [showCategory, setShowCategory] = useState({
    visemes: true,
    jaw: true,
    mouth: true,
    eyes: false,
    brows: false,
    cheeks: false,
    nose: false,
    tongue: false,
  });

  // Handle viseme selection
  const handleVisemeSelect = (visemeCode) => {
    setSelectedViseme(visemeCode);
    if (onVisemeSelect) {
      onVisemeSelect(visemeCode);
    }
  };

  // Handle blend shape slider change
  const handleSliderChange = (shapeName, value) => {
    const newValues = { ...blendShapeValues, [shapeName]: parseFloat(value) };
    setBlendShapeValues(newValues);
    
    if (onBlendShapeChange) {
      onBlendShapeChange(shapeName, parseFloat(value));
    }
  };

  // Reset all blend shapes
  const handleReset = () => {
    const resetValues = {};
    blendShapes.forEach(shape => {
      resetValues[shape.name] = shape.default;
    });
    setBlendShapeValues(resetValues);
    
    // Notify parent to reset all
    if (onBlendShapeChange) {
      Object.keys(resetValues).forEach(shapeName => {
        onBlendShapeChange(shapeName, resetValues[shapeName]);
      });
    }
  };

  // Categorize blend shapes
  const getBlendShapesByCategory = (category) => {
    const categoryMap = {
      jaw: ['jawOpen', 'jawForward', 'jawLeft', 'jawRight'],
      mouth: blendShapes.filter(s => s.name.startsWith('mouth')).map(s => s.name),
      eyes: blendShapes.filter(s => s.name.startsWith('eye')).map(s => s.name),
      brows: blendShapes.filter(s => s.name.startsWith('brow')).map(s => s.name),
      cheeks: blendShapes.filter(s => s.name.startsWith('cheek')).map(s => s.name),
      nose: blendShapes.filter(s => s.name.startsWith('nose')).map(s => s.name),
      tongue: ['tongueOut'],
    };
    
    return blendShapes.filter(shape => categoryMap[category]?.includes(shape.name));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sticky top-0 z-10">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Blend Shape Controller
        </h2>
        <p className="text-purple-100 text-xs mt-1">Test avatar facial expressions</p>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 space-y-4 custom-scrollbar">
        
        {/* Viseme Selection */}
        <div className="space-y-2">
          <button
            onClick={() => setShowCategory(prev => ({ ...prev, visemes: !prev.visemes }))}
            className="w-full flex items-center justify-between bg-purple-700/30 hover:bg-purple-700/50 p-3 rounded-lg transition-all"
          >
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">👄</span>
              Viseme Phonemes
            </span>
            <span className="text-white">{showCategory.visemes ? '▼' : '▶'}</span>
          </button>
          
          {showCategory.visemes && (
            <div className="grid grid-cols-3 gap-2">
              {visemeOptions.map((viseme) => (
                <button
                  key={viseme.code}
                  onClick={() => handleVisemeSelect(viseme.code)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    selectedViseme === viseme.code
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  title={viseme.label}
                >
                  {viseme.phoneme}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blend Shape Categories */}
        {['jaw', 'mouth', 'eyes', 'brows', 'cheeks', 'nose', 'tongue'].map((category) => {
          const shapes = getBlendShapesByCategory(category);
          if (shapes.length === 0) return null;

          const categoryEmoji = {
            jaw: '🦴',
            mouth: '👄',
            eyes: '👁️',
            brows: '🤨',
            cheeks: '😊',
            nose: '👃',
            tongue: '👅',
          };

          return (
            <div key={category} className="space-y-2">
              <button
                onClick={() => setShowCategory(prev => ({ ...prev, [category]: !prev[category] }))}
                className="w-full flex items-center justify-between bg-blue-700/30 hover:bg-blue-700/50 p-3 rounded-lg transition-all"
              >
                <span className="text-white font-semibold flex items-center gap-2">
                  <span className="text-xl">{categoryEmoji[category]}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({shapes.length})
                </span>
                <span className="text-white">{showCategory[category] ? '▼' : '▶'}</span>
              </button>

              {showCategory[category] && (
                <div className="space-y-3 pl-2">
                  {shapes.map((shape) => (
                    <div key={shape.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-300 text-xs font-medium">
                          {shape.label}
                        </label>
                        <span className="text-purple-400 text-xs font-mono bg-gray-800/50 px-2 py-1 rounded">
                          {blendShapeValues[shape.name].toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={shape.min}
                        max={shape.max}
                        step={shape.step}
                        value={blendShapeValues[shape.name]}
                        onChange={(e) => handleSliderChange(shape.name, e.target.value)}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
        >
          🔄 Reset All
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9333ea, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed, #db2777);
        }
        
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #9333ea, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #9333ea, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
        }
      `}</style>
    </div>
  );
};

export default BlendShapeController;
