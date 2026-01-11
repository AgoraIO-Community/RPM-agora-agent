import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { BlendShapeController } from "./components/BlendShapeController";
import { Visualizer } from "./components/Visualizer";

function App() {
  const [currentExpression, setCurrentExpression] = useState("");
  const [currentAnimation, setCurrentAnimation] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("Aurora"); // Default to Aurora
  
  // Blend shape controller state
  const [showBlendShapeController, setShowBlendShapeController] = useState(false);
  const [manualBlendShapes, setManualBlendShapes] = useState({});
  const [manualViseme, setManualViseme] = useState(null);
  
  // Audio Visualizer state
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [visualizerViseme, setVisualizerViseme] = useState(null);
  const [visualizerAudioLevel, setVisualizerAudioLevel] = useState(0);
  
  // Visualization modes
  const [showWireframe, setShowWireframe] = useState(false);

  // Handle blend shape changes from the controller
  const handleBlendShapeChange = (shapeName, value) => {
    setManualBlendShapes(prev => ({
      ...prev,
      [shapeName]: value
    }));
  };

  // Handle viseme selection from the controller
  const handleVisemeSelect = (visemeCode) => {
    setManualViseme(visemeCode);
  };

  return (
    <>
      <Loader />
      <Leva hidden />
      <UI 
        currentExpression={currentExpression} 
        setCurrentExpression={setCurrentExpression}
        currentAnimation={currentAnimation}
        setCurrentAnimation={setCurrentAnimation}
        currentAvatar={currentAvatar}
        setCurrentAvatar={setCurrentAvatar}
        showBlendShapeController={showBlendShapeController}
        setShowBlendShapeController={setShowBlendShapeController}
        showVisualizer={showVisualizer}
        setShowVisualizer={setShowVisualizer}
        showWireframe={showWireframe}
        setShowWireframe={setShowWireframe}
      />
      <BlendShapeController 
        isVisible={showBlendShapeController}
        onBlendShapeChange={handleBlendShapeChange}
        onVisemeSelect={handleVisemeSelect}
      />
      {showVisualizer && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-[450px] max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🎵</span>
                  Audio Visualizer
                </h2>
                <p className="text-blue-100 text-xs mt-1">Test audio files with viseme detection</p>
              </div>
              <button
                onClick={() => setShowVisualizer(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                title="Close Visualizer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 visualizer-scrollbar">
            <Visualizer 
              onVisemeChange={setVisualizerViseme}
              onAudioLevelChange={setVisualizerAudioLevel}
            />
          </div>
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience 
          currentExpression={currentExpression} 
          currentAnimation={currentAnimation}
          currentAvatar={currentAvatar}
          manualBlendShapes={showBlendShapeController ? manualBlendShapes : null}
          manualViseme={showBlendShapeController ? manualViseme : null}
          visualizerViseme={showVisualizer ? visualizerViseme : null}
          visualizerAudioLevel={showVisualizer ? visualizerAudioLevel : 0}
          showWireframe={showWireframe}
        />
      </Canvas>
    </>
  );
}

export default App;
