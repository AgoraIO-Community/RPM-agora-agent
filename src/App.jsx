import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { BlendShapeController } from "./components/BlendShapeController";

function App() {
  const [currentExpression, setCurrentExpression] = useState("");
  const [currentAnimation, setCurrentAnimation] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("Aurora"); // Default to Aurora
  
  // Blend shape controller state
  const [showBlendShapeController, setShowBlendShapeController] = useState(false);
  const [manualBlendShapes, setManualBlendShapes] = useState({});
  const [manualViseme, setManualViseme] = useState(null);
  
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
        showWireframe={showWireframe}
        setShowWireframe={setShowWireframe}
      />
      <BlendShapeController 
        isVisible={showBlendShapeController}
        onBlendShapeChange={handleBlendShapeChange}
        onVisemeSelect={handleVisemeSelect}
      />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience 
          currentExpression={currentExpression} 
          currentAnimation={currentAnimation}
          currentAvatar={currentAvatar}
          manualBlendShapes={showBlendShapeController ? manualBlendShapes : null}
          manualViseme={showBlendShapeController ? manualViseme : null}
          showWireframe={showWireframe}
        />
      </Canvas>
    </>
  );
}

export default App;
