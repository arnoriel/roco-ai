import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
const RocobotPage: React.FC = () => {
  // --- STATE INTRO ---
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  // --- STATE & REFS APP ---
  const mountRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const isSpeakingRef = useRef(false);
  // Refs untuk Animasi Parts
  const robotGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null); // Dada (Power Core)
  const visorRef = useRef<THREE.Mesh>(null); // Mata (Visor)
  const leftWeaponRef = useRef<THREE.Group>(null);
  const rightWeaponRef = useRef<THREE.Group>(null);
  const weaponGlowsRef = useRef<THREE.Mesh[]>([]); // Array untuk glow senjata
  const neuronParticlesRef = useRef<THREE.Points>(null);
  const backRingRef = useRef<THREE.Mesh>(null);
  // --- LOGIC SEQUENCE INTRO ---
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer1 = setTimeout(() => setIntroStep(1), 2500);
    const timer2 = setTimeout(() => setIntroStep(2), 5000);
    const timer3 = setTimeout(() => {
      setIsIntroActive(false);
      document.body.style.overflow = "auto";
    }, 8000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  // --- LOAD VOICES ---
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesLoaded(true);
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);
  // --- THREE.JS LOGIC ---
  useEffect(() => {
    if (!mountRef.current || isIntroActive) return;
    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Background sedikit lebih gelap biar sangar
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.8, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    // 2. CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.target.set(0, 0.5, 0);
    // --- NEURON BACKGROUND ---
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 12;
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.02, color: 0x00f3ff, transparent: true, opacity: 0.4 });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    (neuronParticlesRef as any).current = particlesMesh;
    // --- LIGHTING (Lebih Dramatis) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
   
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);
    const rimLight = new THREE.SpotLight(0x00f3ff, 2); // Rim light biru
    rimLight.position.set(-5, 5, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);
    // --- ROBOT MODEL (WAR MACHINE STYLE) ---
    const robotGroup = new THREE.Group();
    (robotGroupRef as any).current = robotGroup;
    // Materials
    const armorWhiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.6 });
    const armorGreyMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.8 }); // Dark Grey Armor
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.5 }); // Black rubber/metal
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff }); // Cyan Energy
    // 1. TORSO (Heavy Armor)
    const torsoGroup = new THREE.Group();
    // Chest Plate (Hexagonal bulky shape)
    const chestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.2, 6), armorWhiteMat);
    chestPlate.position.y = 0.2;
    torsoGroup.add(chestPlate);
   
    // Abdomen (Abs Plating)
    const abs = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.8, 6), armorGreyMat);
    abs.position.y = -0.7;
    torsoGroup.add(abs);
    // Core Reactor (Pulsing Heart)
    const reactorRim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 16, 32), armorGreyMat);
    reactorRim.position.set(0, 0.3, 0.82);
    reactorRim.rotation.x = Math.PI / 6; // Miring sedikit mengikuti dada
    torsoGroup.add(reactorRim);
    const reactorCore = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), glowMat.clone());
    reactorCore.position.set(0, 0.3, 0.83);
    reactorCore.rotation.x = -Math.PI / 3; // Menghadap depan
    coreRef.current = reactorCore;
    torsoGroup.add(reactorCore);
    // Vents/Detailing on Chest
    const ventL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.1), armorGreyMat);
    ventL.position.set(-0.5, 0.3, 0.75);
    ventL.rotation.y = 0.5;
    torsoGroup.add(ventL);
   
    const ventR = ventL.clone();
    ventR.position.set(0.5, 0.3, 0.75);
    ventR.rotation.y = -0.5;
    torsoGroup.add(ventR);
    robotGroup.add(torsoGroup);
    // 2. HEAD (Combat Helmet)
    const headGroup = new THREE.Group();
    // Helmet Base
    const helmetBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.8), armorWhiteMat);
    headGroup.add(helmetBase);
   
    // Face Plate / Mask (Chin Guard)
    const chinGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.4, 6), armorGreyMat);
    chinGuard.position.set(0, -0.25, 0.35);
    chinGuard.rotation.y = Math.PI / 6;
    headGroup.add(chinGuard);
    // Visor (Combat Eye)
    const visorGeo = new THREE.BoxGeometry(0.65, 0.15, 0.1);
    const visor = new THREE.Mesh(visorGeo, glowMat.clone());
    visor.position.set(0, 0.05, 0.42);
    visorRef.current = visor;
    headGroup.add(visor);
    // Antennas / Tactical Ears
    const earGeo = new THREE.BoxGeometry(0.1, 0.5, 0.3);
    const earL = new THREE.Mesh(earGeo, armorGreyMat);
    earL.position.set(-0.4, 0, 0);
    headGroup.add(earL);
    const earR = earL.clone();
    earR.position.set(0.4, 0, 0);
    headGroup.add(earR);
    headGroup.position.y = 1.3;
    headRef.current = headGroup;
    robotGroup.add(headGroup);
    // 3. ARMS (Projectile Weapons)
    const createWeaponArm = (side: number) => {
      const armGroup = new THREE.Group();
     
      // Shoulder Pad (Bulky Sphere/Icosahedron)
      const shoulder = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), armorWhiteMat);
      armGroup.add(shoulder);
      // Upper Arm
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.7, 8), jointMat);
      upperArm.position.y = -0.5;
      armGroup.add(upperArm);
      // Elbow Armor
      const elbow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), armorGreyMat);
      elbow.position.y = -0.9;
      armGroup.add(elbow);
      // Forearm Cannon (The Weapon)
      const cannonGroup = new THREE.Group();
      cannonGroup.position.y = -1.4;
      // Main Barrel Housing
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.5), armorWhiteMat);
      cannonGroup.add(housing);
      // Barrels (2 proyektil)
      const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16);
      barrelGeo.rotateX(Math.PI / 2); // Menghadap ke depan (Z)
     
      const barrel1 = new THREE.Mesh(barrelGeo, armorGreyMat);
      barrel1.position.set(0.1, -0.2, 0.4);
      cannonGroup.add(barrel1);
     
      const barrel2 = new THREE.Mesh(barrelGeo, armorGreyMat);
      barrel2.position.set(-0.1, -0.2, 0.4);
      cannonGroup.add(barrel2);
      // Energy Cell (Ammo)
      const ammoCell = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16), glowMat.clone());
      ammoCell.rotation.z = Math.PI / 2;
      ammoCell.position.set(side * 0.25, 0.1, 0); // Di samping senjata
      cannonGroup.add(ammoCell);
      weaponGlowsRef.current.push(ammoCell); // Simpan ref untuk animasi
      // Muzzle Glow (Ujung Laras)
      const muzzleGlow = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.08, 16), glowMat.clone());
      muzzleGlow.position.set(0.1, -0.2, 0.91);
      cannonGroup.add(muzzleGlow);
      const muzzleGlow2 = muzzleGlow.clone();
      muzzleGlow2.position.set(-0.1, -0.2, 0.91);
      cannonGroup.add(muzzleGlow2);
      armGroup.add(cannonGroup);
     
      // Positioning Arm
      armGroup.position.set(side * 1.1, 0.7, 0); // Lebih lebar bahunya
      return armGroup;
    };
    const leftArm = createWeaponArm(-1);
    const rightArm = createWeaponArm(1);
   
    leftWeaponRef.current = leftArm;
    rightWeaponRef.current = rightArm;
    robotGroup.add(leftArm, rightArm);
    // 4. BACK RING (Tactical Radar / Booster)
    const backRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.05, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.3 })
    );
    backRing.position.set(0, 0.5, -0.6);
    backRingRef.current = backRing;
    robotGroup.add(backRing);
    scene.add(robotGroup);
    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
   
    const animate = () => {
      if (!mountRef.current) return;
      requestAnimationFrame(animate);
     
      const time = clock.getElapsedTime();
      controls.update();
      // Animasi Background
      if (neuronParticlesRef.current) neuronParticlesRef.current.rotation.y = time * 0.02;
      // Base Breathing Animation (Heavy Mech Style)
      robotGroup.position.y = Math.sin(time * 0.8) * 0.1; // Lambat dan berat
      // Charging Logic (Pulse)
      // Jika bicara, pulse cepat. Jika diam, pulse lambat (standby).
      const pulseSpeed = isSpeakingRef.current ? 10 : 2;
      const pulseIntensity = (Math.sin(time * pulseSpeed) + 1) * 0.5; // 0 to 1
      // 1. Core Pulsing
      if (coreRef.current) {
        (coreRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + (pulseIntensity * 0.5);
      }
      // 2. Weapon & Visor Pulsing
      if (visorRef.current) {
         // Random glitch/blink effect
         if (Math.random() > 0.98) {
            visorRef.current.scale.y = 0.1; // Blink
         } else {
            visorRef.current.scale.y = 1;
         }
         (visorRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 + (pulseIntensity * 0.2);
      }
     
      weaponGlowsRef.current.forEach(mesh => {
          (mesh.material as THREE.MeshBasicMaterial).opacity = 0.4 + (pulseIntensity * 0.6);
      });
      // 3. Movement Logic
      if (isSpeakingRef.current) {
        // Combat Stance Active
        robotGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
       
        // Head Tracking / Bobbing
        if (headRef.current) {
            headRef.current.rotation.x = Math.sin(time * 5) * 0.05;
            headRef.current.rotation.y = Math.sin(time * 2) * 0.1;
        }
        // Arms Recoil Animation (Seolah menembak/active)
        if (leftWeaponRef.current) leftWeaponRef.current.rotation.x = -0.2 + Math.sin(time * 8) * 0.05;
        if (rightWeaponRef.current) rightWeaponRef.current.rotation.x = -0.2 + Math.cos(time * 8) * 0.05;
        // Ring Speed Up
        if (backRingRef.current) backRingRef.current.rotation.z -= 0.1;
      } else {
        // Standby Mode
        robotGroup.rotation.y = THREE.MathUtils.lerp(robotGroup.rotation.y, 0, 0.05);
        if (headRef.current) {
            headRef.current.rotation.set(0,0,0);
        }
        // Arms Relaxed
        if (leftWeaponRef.current) leftWeaponRef.current.rotation.x = THREE.MathUtils.lerp(leftWeaponRef.current.rotation.x, 0, 0.05);
        if (rightWeaponRef.current) rightWeaponRef.current.rotation.x = THREE.MathUtils.lerp(rightWeaponRef.current.rotation.x, 0, 0.05);
       
        // Ring Slow
        if (backRingRef.current) backRingRef.current.rotation.z -= 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isIntroActive]);
  // --- SUBMIT & TTS LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isLoading || !voicesLoaded) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history: [], mode: "Vanilla", isRocobot: true }),
      });
      const data = await res.json();
      const aiText = data.text || "Error.";
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiText);
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang === "id-ID" && v.name.includes("Google")) || voices.find((v) => v.lang.includes("id")) || voices[0];
       
        if (idVoice) { utterance.voice = idVoice; utterance.lang = "id-ID"; }
        utterance.pitch = 0.2; // Suara lebih rendah (robot besar)
        utterance.rate = 0.9;
       
        utterance.onstart = () => { isSpeakingRef.current = true; };
        utterance.onend = () => { isSpeakingRef.current = false; };
        utterance.onerror = () => { isSpeakingRef.current = false; };
       
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error(error);
      isSpeakingRef.current = false;
    }
    setPrompt("");
    setIsLoading(false);
  };
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {isIntroActive && (
          <motion.div
            key="intro-layer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
          >
            {introStep === 0 && (
              <div className="relative flex items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1], boxShadow: "0px 0px 30px 10px #00f3ff" }} transition={{ duration: 1 }} className="w-4 h-4 bg-cyan-400 rounded-full z-50" />
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i} animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} className="absolute w-12 h-12 border border-cyan-500 rounded-full blur-sm" />
                ))}
              </div>
            )}
            {introStep >= 1 && (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 150 }} transition={{ duration: 1.2, ease: "circIn" }} className="absolute w-10 h-10 bg-gray-900 rounded-full" />
                {introStep === 1 && (
                  <motion.h1 initial={{ opacity: 0, scale: 0.5, letterSpacing: "20px" }} animate={{ opacity: 1, scale: 1, letterSpacing: "4px" }} className="z-50 text-5xl font-black text-cyan-400 font-mono italic drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
                    WAR-MACHINE: ONLINE
                  </motion.h1>
                )}
              </>
            )}
            {introStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-50 flex flex-col items-center">
                <h2 className="text-xl font-light tracking-[0.8em] text-cyan-200 uppercase">System Initialized</h2>
                <motion.span animate={{ scale: [1, 1.1, 1], textShadow: ["0px 0px 10px #00f3ff", "0px 0px 30px #00f3ff", "0px 0px 10px #00f3ff"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl font-bold text-white mt-4">READY</motion.span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,50,60,0.1)_0%,_transparent_100%)] pointer-events-none" />
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <Link href="/">
        <button className="absolute top-6 left-6 z-20 px-5 py-2 bg-black/40 backdrop-blur-xl text-cyan-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-500/30 hover:bg-cyan-900/30 transition-all">
          ← Disengage
        </button>
      </Link>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex gap-3 items-center bg-gray-900/80 backdrop-blur-3xl p-2 rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-900/20">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Input Command..."
              className="flex-1 bg-transparent px-4 py-3 text-cyan-100 focus:outline-none text-sm font-mono placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-cyan-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
            >
              {isLoading ? "PROCESSING..." : "TRANSMIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RocobotPage;