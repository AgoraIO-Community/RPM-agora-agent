/*
Enhanced 3D Avatar Component for Agora Agent
Features advanced facial expressions, lip-sync, and multi-avatar support
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { useChat } from "../hooks/useChat";
import { useAgora } from "../hooks/useAgora";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.15,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_aa",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_sil",
};

// Oculus/Meta Quest viseme blend shapes - use them directly!
// These are the actual blend shape names on the avatar
const oculusVisemes = [
  'viseme_sil',  // silence
  'viseme_PP',   // p, b, m
  'viseme_FF',   // f, v
  'viseme_TH',   // th
  'viseme_DD',   // d, t, n, l
  'viseme_kk',   // k, g
  'viseme_CH',   // ch, j, sh
  'viseme_SS',   // s, z
  'viseme_nn',   // n, ng
  'viseme_RR',   // r
  'viseme_aa',   // aa (father)
  'viseme_E',    // eh (bed)
  'viseme_I',    // ee (see)
  'viseme_O',    // oh (go)
  'viseme_U',    // oo (boot)
];

// No need for mouthMorphTargets - we'll use the viseme blend shapes directly!

let setupMode = false;

export function Avatar({ 
  currentExpression, 
  currentAnimation, 
  currentAvatar = "Aurora",
  manualBlendShapes = null,
  manualViseme = null,
  visualizerViseme = null,
  visualizerAudioLevel = 0,
  showWireframe = false,
  ...props 
}) {
  // Define available avatars
  const availableAvatars = {
    Aurora: "Aurora.glb",
    Celeste: "Celeste.glb", 
    Lyra: "Lyra.glb"
  };

  // Load the selected avatar model
  const avatarModel = availableAvatars[currentAvatar] || availableAvatars.Aurora;
  const { nodes, materials, scene } = useGLTF(
    `${import.meta.env.BASE_URL}models/Avatars/${avatarModel}`
  );

  const { message, onMessagePlayed, chat } = useChat();
  const { lipSyncData, audioLevel } = useAgora(); // Get WebAudio lip sync data

  const [lipsync, setLipsync] = useState();
  
  // Smoothing states for lip sync
  const smoothedAudioLevel = useRef(0);
  const lastViseme = useRef('X');
  const visemeTransition = useRef(0);
  const mouthTargetValues = useRef({});

  useEffect(() => {
    console.log(message);
    if (!message) {
      // If no manual animation override, use Idle
      if (!currentAnimation) {
        setAnimation("Idle");
      }
      return;
    }
    // During message playback, use message animation if no manual override
    if (!currentAnimation) {
      setAnimation(message.animation);
    }
    // Use message facial expression if no manual override
    if (!currentExpression) {
      setFacialExpression(message.facialExpression);
    }
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
  }, [message, currentAnimation, currentExpression]);

  const { animations } = useGLTF(`${import.meta.env.BASE_URL}models/animations.glb`);

  // Debug: Log available animations to help fix UI
  useEffect(() => {
    console.log('Available animations:', animations.map(a => a.name));
    console.log('Current avatar:', currentAvatar);
    console.log('Avatar model path:', `${import.meta.env.BASE_URL}models/Avatars/${avatarModel}`);
  }, [animations, currentAvatar, avatarModel]);

  const group = useRef();
  const animationMixer = useRef();
  const animationActions = useRef({});
  
  // Custom animation system that works with any avatar
  useEffect(() => {
    if (group.current && animations.length > 0 && scene) {
      console.log(`🎭 Setting up animations for avatar: ${currentAvatar}`);
      console.log('Group children count:', group.current.children.length);
      
      // Clear previous mixer
      if (animationMixer.current) {
        console.log('Clearing previous animation mixer');
        animationMixer.current.stopAllAction();
        animationMixer.current.setTime(0);
        animationMixer.current = null;
      }

      // Wait for the scene to be fully loaded
      setTimeout(() => {
        if (!group.current) return;
        
        // Find the skeleton root (usually named "Hips")
        let skeletonRoot = null;
        scene.traverse((child) => {
          if (child.type === 'Bone' && child.name === 'Hips') {
            skeletonRoot = child;
            console.log(`Found skeleton root: ${child.name}`);
          }
        });

        // Use the skeleton root or fallback to group.current
        const animationTarget = skeletonRoot || group.current;
        console.log(`🎯 Animation target: ${animationTarget.name || animationTarget.type}`);
        
        // Create new animation mixer
        animationMixer.current = new THREE.AnimationMixer(animationTarget);
        
        // Suppress PropertyBinding warnings for missing nodes
        animationMixer.current.addEventListener('loop', () => {});
        const originalWarn = console.warn;
        console.warn = (...args) => {
          if (args[0]?.includes?.('PropertyBinding') || args[0]?.includes?.('trying to update node')) {
            return; // Suppress PropertyBinding warnings
          }
          originalWarn.apply(console, args);
        };
        
        animationActions.current = {};
        
        // Create actions for all animations
        let successCount = 0;
        animations.forEach((clip) => {
          try {
            const action = animationMixer.current.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            animationActions.current[clip.name] = action;
            successCount++;
            console.log(`✅ Created action for: ${clip.name}`);
          } catch (error) {
            console.warn(`❌ Failed to create action for ${clip.name}:`, error.message);
          }
        });
        
        // Restore console.warn
        console.warn = originalWarn;
        
        console.log(`🎬 Animation setup complete: ${successCount}/${animations.length} actions created for ${currentAvatar}`);
        console.log('Available actions:', Object.keys(animationActions.current));
        
        // Start default animation after setup
        if (animationActions.current['Idle']) {
          console.log('🚀 Starting default Idle animation');
          animationActions.current['Idle'].play();
        }
      }, 100); // Small delay to ensure scene is ready
    }
    
    return () => {
      if (animationMixer.current) {
        console.log(`🧹 Cleaning up animations for ${currentAvatar}`);
        animationMixer.current.stopAllAction();
        animationMixer.current = null;
      }
    };
  }, [currentAvatar, animations, scene]);
  
  // Apply wireframe mode to all meshes
  useEffect(() => {
    if (!scene) return;
    
    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.wireframe = showWireframe;
          });
        }
      }
    });
    
    return () => {
      scene.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(mat => {
              mat.wireframe = false;
            });
          }
        }
      });
    };
  }, [showWireframe, scene]);
  
  // Update animation mixer on each frame and handle facial expressions
  useFrame((state, deltaTime) => {
    // Update custom animation mixer
    if (animationMixer.current) {
      animationMixer.current.update(deltaTime);
    }
    
    // Handle facial expressions
    const morphMesh = getMorphTargetMesh();
    if (!setupMode && morphMesh && morphMesh.morphTargetDictionary) {
      Object.keys(morphMesh.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // LIPSYNC - WebAudio based with smooth interpolation
    if (setupMode) {
      return;
    }

    // Apply manual blend shapes if provided (from BlendShapeController)
    if (manualBlendShapes) {
      Object.entries(manualBlendShapes).forEach(([shapeName, value]) => {
        lerpMorphTarget(shapeName, value, 0.2);
      });
    }

    // Apply manual viseme if provided (from BlendShapeController)
    if (manualViseme) {
      // Manual viseme now comes as Oculus viseme name directly (e.g., 'viseme_aa', 'viseme_I')
      lerpMorphTarget(manualViseme, 1.0, 0.2);
      
      // Add slight jaw movement for natural look
      lerpMorphTarget("jawOpen", 0.4, 0.2);
      
      return; // Skip automatic lip sync when manual control is active
    }

    const appliedMorphTargets = [];
    
    // Priority: 1. Visualizer viseme, 2. WebAudio lip sync data
    const activeViseme = visualizerViseme || (lipSyncData && lipSyncData.viseme);
    // Use raw audio levels for both - no smoothing for more responsive movement
    const activeAudioLevel = visualizerAudioLevel > 0 ? visualizerAudioLevel : (audioLevel || 0);
    
    if (activeViseme && activeAudioLevel > 0.01) {
      // For Oculus visemes, apply the blend shape directly!
      // The viseme name IS the blend shape name
      const visemeBlendShape = activeViseme; // e.g., 'viseme_aa', 'viseme_I', etc.
      
      // Handle viseme transitions smoothly
      if (lastViseme.current !== activeViseme) {
        visemeTransition.current = 0;
        lastViseme.current = activeViseme;
      }
      visemeTransition.current = Math.min(visemeTransition.current + deltaTime * 20, 1); // Very fast transitions for natural speech
      
      // Apply the viseme blend shape directly with higher intensity for visibility
      const intensity = Math.min(activeAudioLevel * 4.0, 1.0) * visemeTransition.current; // Increased from 2.5 to 4.0
      lerpMorphTarget(visemeBlendShape, intensity, 0.5); // Faster lerp (0.7->0.5) for responsiveness
      appliedMorphTargets.push(visemeBlendShape);
      
      // Add more pronounced jaw movement for natural speech
      const jawAmount = activeAudioLevel * 0.8 * visemeTransition.current; // Increased from 0.5 to 0.8
      if (jawAmount > 0.03) {
        lerpMorphTarget("jawOpen", Math.min(jawAmount, 0.8), 0.5); // Allow up to 0.8 jaw opening
        appliedMorphTargets.push("jawOpen");
      }
    }
    // Fallback to original message-based lip sync with smoothing
    else if (message && lipsync) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          const visemeValue = mouthCue.value;
          const visemeTarget = corresponding[visemeValue];
          const mouthShape = mouthMorphTargets[visemeValue];
          
          if (visemeTarget) {
            appliedMorphTargets.push(visemeTarget);
            lerpMorphTarget(visemeTarget, 1, 0.4);
          }
          
          // Apply enhanced mouth shapes with smooth transitions
          if (mouthShape) {
            Object.entries(mouthShape).forEach(([morphTarget, value]) => {
              smoothLerpMouthTarget(morphTarget, value, deltaTime);
              appliedMorphTargets.push(morphTarget);
            });
          }
          break;
        }
      }
    }

    // Reset unused morph targets with smooth transitions
    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.2);
    });
    
    // Smoothly reset mouth morph targets when no audio
    const allMouthTargets = [
      "jawOpen", "mouthOpen", "mouthWide", "mouthSmileLeft", "mouthSmileRight",
      "mouthFunnel", "mouthPucker", "mouthPressLeft", "mouthPressRight", 
      "mouthClose", "tongueOut", "mouthLeft", "mouthRight"
    ];
    
    allMouthTargets.forEach((target) => {
      if (!appliedMorphTargets.includes(target)) {
        smoothLerpMouthTarget(target, 0, deltaTime);
      }
    });
    
    // Smooth reset when no audio activity
    if (!lipSyncData || smoothedAudioLevel.current <= 0.01) {
      // Gentle reset to slightly open mouth for natural look
      smoothLerpMouthTarget("jawOpen", 0.02, deltaTime);
      smoothLerpMouthTarget("mouthOpen", 0.01, deltaTime);
    }
  });
  
  // Legacy actions and mixer for compatibility (keeping for now)
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name // Check if Idle animation exists otherwise use first animation
  );
  
  // Update animation when currentAnimation prop changes
  useEffect(() => {
    if (currentAnimation) {
      // Check if the animation exists before trying to set it
      const animationExists = animations.find(a => a.name === currentAnimation);
      if (animationExists) {
        setAnimation(currentAnimation);
        
        // Auto-map animation to facial expression if no manual expression override
        if (!currentExpression) {
          const animationToExpressionMap = {
            "Idle": "",
            "Laughing": "funnyFace",
            "Crying": "sad", 
            "Angry": "angry",
            "Terrified": "surprised",
            "Talking_0": "",
            "Talking_1": "smile",
            "Talking_2": "surprised"
          };
          
          const mappedExpression = animationToExpressionMap[currentAnimation];
          if (mappedExpression !== undefined) {
            setFacialExpression(mappedExpression);
          }
        }
      } else {
        console.warn(`Animation "${currentAnimation}" not found. Available animations:`, animations.map(a => a.name));
        // Fallback to Idle if animation doesn't exist
        setAnimation("Idle");
      }
    } else if (!message) {
      setAnimation("Idle");
    }
  }, [currentAnimation, message, animations, currentExpression]);
  
  useEffect(() => {
    // Play animation using custom system
    console.log(`Attempting to play animation: ${animation} for avatar: ${currentAvatar}`);
    console.log('Custom actions available:', Object.keys(animationActions.current));
    
    if (animationActions.current[animation]) {
      console.log(`✓ Playing animation: ${animation} using custom system`);
      
      // Stop all other animations with fade out
      Object.entries(animationActions.current).forEach(([name, action]) => {
        if (name !== animation && action.isRunning()) {
          action.fadeOut(0.3);
        }
      });
      
      // Play the requested animation with fade in
      const action = animationActions.current[animation];
      action.reset();
      action.fadeIn(0.3);
      action.play();
      
      return () => {
        if (action && action.isRunning()) {
          action.fadeOut(0.3);
        }
      };
    } else {
      console.warn(`✗ Animation "${animation}" not found in custom actions for ${currentAvatar}:`, Object.keys(animationActions.current));
      
      // Fallback to legacy system
      if (actions[animation]) {
        console.log(`Fallback: Using legacy action for ${animation}`);
        actions[animation]
          .reset()
          .fadeIn(mixer && mixer.stats.actions.inUse === 0 ? 0 : 0.5)
          .play();
        return () => {
          if (actions[animation]) {
            actions[animation].fadeOut(0.5);
          }
        };
      } else {
        console.warn(`Animation "${animation}" not found in either system`);
      }
    }
  }, [animation, actions, mixer, currentAvatar]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };

  // Enhanced smooth interpolation for mouth targets with easing
  const smoothLerpMouthTarget = (target, targetValue, deltaTime) => {
    if (!mouthTargetValues.current[target]) {
      mouthTargetValues.current[target] = 0;
    }
    
    // Faster interpolation with more visible movements
    const isOpening = targetValue > mouthTargetValues.current[target];
    const smoothSpeed = isOpening ? 15.0 : 18.0; // Much faster for more visible changes
    
    mouthTargetValues.current[target] = THREE.MathUtils.lerp(
      mouthTargetValues.current[target],
      targetValue,
      1 - Math.exp(-smoothSpeed * deltaTime)
    );
    
    lerpMorphTarget(target, mouthTargetValues.current[target], 0.9); // Higher lerp factor
  };

  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();

  // Update facial expression when currentExpression prop changes
  useEffect(() => {
    if (currentExpression) {
      setFacialExpression(currentExpression);
    } else if (!message) {
      setFacialExpression(""); // Reset to default when no override and no message
    }
  }, [currentExpression, message]);

  // Helper function to get the first mesh with morph targets from current avatar
  const getMorphTargetMesh = () => {
    let morphTargetMesh = null;
    scene.traverse((child) => {
      if (!morphTargetMesh && child.isSkinnedMesh && child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 0) {
        morphTargetMesh = child;
      }
    });
    return morphTargetMesh;
  };

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      const morphMesh = getMorphTargetMesh();
      if (!morphMesh || !morphMesh.morphTargetDictionary) {
        console.log("No morph target mesh found for current avatar");
        return;
      }
      
      const emotionValues = {};
      Object.keys(morphMesh.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        const value =
          morphMesh.morphTargetInfluences[
            morphMesh.morphTargetDictionary[key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () => {
    const morphMesh = getMorphTargetMesh();
    if (!morphMesh || !morphMesh.morphTargetDictionary) {
      return {};
    }
    
    return Object.assign(
      {},
      ...Object.keys(morphMesh.morphTargetDictionary).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: morphMesh.morphTargetInfluences[
              morphMesh.morphTargetDictionary[key]
            ],
            max: 1,
            onChange: (val) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    );
  });

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

// Preload all avatar models
useGLTF.preload(`${import.meta.env.BASE_URL}models/Avatars/Aurora.glb`);
useGLTF.preload(`${import.meta.env.BASE_URL}models/Avatars/Celeste.glb`);
useGLTF.preload(`${import.meta.env.BASE_URL}models/Avatars/Lyra.glb`);
useGLTF.preload(`${import.meta.env.BASE_URL}models/animations.glb`);
