import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";

const RocobotPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSpeakingRef = useRef(false);
  const mouthRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const backRingRef = useRef<THREE.Mesh>(null); 
  const neuronParticlesRef = useRef<THREE.Points>(null);

  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesLoaded(true);
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd3d3d3);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- NEURON BACKGROUND ---
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x00a8b3,
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    (neuronParticlesRef as any).current = particlesMesh;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(2, 5, 5);
    scene.add(mainLight);

    // --- ROBOT MODEL ---
    const robotGroup = new THREE.Group();
    const roboMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.4 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.9 });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.2, 1.3, 6);
    const torso = new THREE.Mesh(torsoGeo, roboMat);
    robotGroup.add(torso);

    // 2. Chest Ring
    const chestRingGeo = new THREE.TorusGeometry(0.18, 0.04, 16, 100);
    const chestRing = new THREE.Mesh(chestRingGeo, new THREE.MeshBasicMaterial({ color: 0x00f3ff }));
    chestRing.position.set(0, 0.3, 0.65);
    robotGroup.add(chestRing);

    // 3. Head & Face
    const headGroup = new THREE.Group();
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.55), roboMat);
    headGroup.add(head);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    face.position.z = 0.28;
    headGroup.add(face);

    const eyeGeo = new THREE.PlaneGeometry(0.14, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, glowMat.clone());
    eyeL.position.set(-0.18, 0.05, 0.29);
    eyeLeftRef.current = eyeL;
    headGroup.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.18;
    eyeRightRef.current = eyeR;
    headGroup.add(eyeR);

    const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.02), glowMat.clone());
    mouth.position.set(0, -0.1, 0.29);
    mouthRef.current = mouth;
    headGroup.add(mouth);

    headGroup.position.y = 1.05;
    robotGroup.add(headGroup);

    // 4. Arms (With Detailed Fingers)
    const createArm = (side: number) => {
      const armGroup = new THREE.Group();
      
      // Shoulder, Upper Arm, Elbow, Forearm tetap sama
      armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), jointMat));
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.6, 8), roboMat);
      upper.position.y = -0.35;
      armGroup.add(upper);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), jointMat);
      elbow.position.y = -0.7;
      armGroup.add(elbow);
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 8), roboMat);
      forearm.position.y = -0.95;
      armGroup.add(forearm);

      const handGroup = new THREE.Group();
      handGroup.position.y = -1.25;
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.12), roboMat);
      handGroup.add(palm);

      const handGlow = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 16, 32), new THREE.MeshBasicMaterial({ color: 0x00f3ff }));
      handGlow.position.set(0, 0, 0.07);
      handGroup.add(handGlow);

      const createFinger = (width: number, height: number, x: number, y: number, z: number, rotZ: number = 0) => {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.06), roboMat);
        finger.position.set(x, y, z);
        finger.rotation.z = rotZ;
        return finger;
      };

      /**
       * LOGIKA PERBAIKAN:
       * side 1  = Tangan Kanan (Ibu jari harus di KIRI telapak tangan / sisi negatif X)
       * side -1 = Tangan Kiri  (Ibu jari harus di KANAN telapak tangan / sisi positif X)
       */
      const isRightHand = side === 1;
      const thumbSide = isRightHand ? -1 : 1; // Ibu jari selalu menghadap ke badan

      // 1. Ibu Jari (Thumb) - Mengarah ke dalam
      handGroup.add(createFinger(0.07, 0.12, thumbSide * 0.16, -0.05, 0, thumbSide * 0.5));

      // Urutan Jari lainnya (Telunjuk ke Kelingking)
      // Kita gunakan thumbSide agar arah urutannya konsisten menghadap ke luar badan
      handGroup.add(createFinger(0.045, 0.14, thumbSide * 0.08, -0.18, 0));  // Telunjuk
      handGroup.add(createFinger(0.045, 0.16, thumbSide * 0.01, -0.19, 0));  // Tengah
      handGroup.add(createFinger(0.045, 0.14, thumbSide * -0.06, -0.18, 0)); // Manis
      handGroup.add(createFinger(0.04, 0.11, thumbSide * -0.12, -0.16, 0));  // Kelingking

      armGroup.add(handGroup);
      armGroup.position.set(side * 0.65, 0.6, 0);
      armGroup.rotation.z = side * 0.4; 
      return armGroup;
    };
    robotGroup.add(createArm(-1), createArm(1));

    // --- GIANT BACK RING ---
    const backRingGeo = new THREE.TorusGeometry(0.9, 0.08, 16, 100);
    const backRingMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f3ff, 
      transparent: true, 
      opacity: 0.8 
    });
    const backRing = new THREE.Mesh(backRingGeo, backRingMat);
    backRing.position.set(0, 0.8, -0.5);
    backRingRef.current = backRing;
    robotGroup.add(backRing);

    scene.add(robotGroup);

    // --- ANIMATION ---
    const clock = new THREE.Clock();
    let lastBlink = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (neuronParticlesRef.current) {
        neuronParticlesRef.current.rotation.y = time * 0.02;
        neuronParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      robotGroup.position.y = 0.5 + Math.sin(time * 1.5) * 0.1;

      // --- ANIMASI RING PUNGGUNG (FIXED TS ERROR) ---
      if (backRingRef.current) {
        backRingRef.current.position.y = 0.8 + Math.sin(time * 2) * 0.05;
        backRingRef.current.rotation.z = time * 0.3;
        
        // Perbaikan Error TS: Mengarahkan material ke tipe yang benar
        const material = backRingRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = 0.6 + Math.abs(Math.sin(time * 2)) * 0.3;
      }

      if (mouthRef.current) {
        mouthRef.current.scale.y = isSpeakingRef.current ? 2 + Math.abs(Math.sin(time * 30)) * 8 : 1;
      }

      if (time - lastBlink > 4 && Math.random() > 0.99) {
        [eyeLeftRef.current, eyeRightRef.current].forEach((e) => e && (e.scale.y = 0.1));
        setTimeout(() => [eyeLeftRef.current, eyeRightRef.current].forEach((e) => e && (e.scale.y = 1)), 120);
        lastBlink = time;
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
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

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
      // BATALKAN suara sebelumnya jika masih ada yang bicara
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(aiText);
      const voices = window.speechSynthesis.getVoices();

      // TRACING: Cek suara yang tersedia di device ini
      console.log("Available Voices:", voices.map(v => `${v.name} (${v.lang})`));

      // PRIORITAS 1: Cari suara Bahasa Indonesia dari Google (Paling stabil di Android/Chrome)
      // PRIORITAS 2: Cari suara bahasa Indonesia apapun
      // PRIORITAS 3: Fallback ke suara pertama
      const idVoice = 
        voices.find((v) => v.lang === "id-ID" && v.name.includes("Google")) || 
        voices.find((v) => v.lang.includes("id")) || 
        voices[0];

      if (idVoice) {
        utterance.voice = idVoice;
        utterance.lang = "id-ID"; // Paksa lang ke ID agar browser mencoba menggunakan engine ID
      }

      utterance.pitch = 0.6; // 0.1 terlalu rendah/berat, standar adalah 1.0
      utterance.rate = 1.0;  // Kecepatan normal
      
      utterance.onstart = () => { isSpeakingRef.current = true; };
      utterance.onend = () => { isSpeakingRef.current = false; };
      utterance.onerror = (err) => { 
        console.error("TTS Error:", err);
        isSpeakingRef.current = false; 
      };

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
    <div className="relative h-screen w-screen overflow-hidden bg-gray-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.03)_0%,_transparent_70%)] pointer-events-none" />
      <div ref={mountRef} className="absolute inset-0" />
      <Link href="/"><button className="absolute top-6 left-6 z-20 px-5 py-2 bg-white/40 backdrop-blur-xl text-gray-800 rounded-full text-[10px] font-bold uppercase tracking-widest">← Back</button></Link>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex gap-3 items-center bg-white/80 backdrop-blur-3xl p-2 rounded-2xl border border-gray-300">
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Send Message..." className="flex-1 bg-transparent px-4 py-3 text-gray-800 focus:outline-none text-sm font-mono" />
            <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gray-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
              {isLoading ? "Sending.." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RocobotPage;
