import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";

const RocobotPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSpeakingRef = useRef(false);
  const mouthRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
      setVoicesLoaded(true);
    };
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () =>
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 5);// Kamera agak jauh biar kelihatan seluruh badan

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING (Dibuat seperti studio) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(2, 5, 5);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x00f3ff, 2, 10); // Cahaya biru dari belakang
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // --- DEKORASI BACKGROUND (Cyber Stage) ---
    const stageGeo = new THREE.CylinderGeometry(2, 2.2, 0.2, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -1.6;
    scene.add(stage);

    const glowRingGeo = new THREE.TorusGeometry(1.9, 0.05, 16, 100);
    const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = -1.5;
    scene.add(glowRing);

    // --- ROBOT MODEL ---
    const robotGroup = new THREE.Group();
    const roboMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.3,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.9,
    });

    // 1. Torso (Body tengah)
    const torsoGeo = new THREE.CapsuleGeometry(0.5, 0.7, 4, 16);
    const torso = new THREE.Mesh(torsoGeo, roboMat);
    robotGroup.add(torso);

    // 2. Chest Plate (Dekorasi dada)
    const chestGeo = new THREE.BoxGeometry(0.6, 0.4, 0.2);
    const chest = new THREE.Mesh(chestGeo, roboMat);
    chest.position.set(0, 0.2, 0.4);
    robotGroup.add(chest);

    // 3. Shoulder Joints (Pundak biar tangan nempel)
    const shoulderGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const lShoulder = new THREE.Mesh(shoulderGeo, jointMat);
    lShoulder.position.set(-0.65, 0.4, 0);
    robotGroup.add(lShoulder);

    const rShoulder = lShoulder.clone();
    rShoulder.position.x = 0.65;
    robotGroup.add(rShoulder);

    // 4. Arms (Tangan nempel ke pundak)
    const armGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 12);
    const lArm = new THREE.Mesh(armGeo, roboMat);
    lArm.position.set(-0.8, 0, 0);
    robotGroup.add(lArm);

    const rArm = lArm.clone();
    rArm.position.x = 0.8;
    robotGroup.add(rArm);

    // 5. Head (Rounded Box style)
    const headGeo = new THREE.BoxGeometry(0.8, 0.7, 0.6); // Lebih kotak tapi nanti kita kasih material bagus
    const head = new THREE.Mesh(headGeo, roboMat);
    head.position.y = 1;
    robotGroup.add(head);

    // 6. Face Plate (Layar Hitam di wajah)
    const faceGeo = new THREE.BoxGeometry(0.7, 0.5, 0.1);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 1, 0.3);
    robotGroup.add(face);

    // 7. Eyes (Glowing Blue)
    const eyeGeo = new THREE.PlaneGeometry(0.15, 0.05);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 1.1, 0.36);
    eyeLeftRef.current = eyeL;
    robotGroup.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.2;
    eyeRightRef.current = eyeR;
    robotGroup.add(eyeR);

    // 8. Mouth (Glowing Blue)
    const mouthGeo = new THREE.PlaneGeometry(0.25, 0.03);
    const mouth = new THREE.Mesh(mouthGeo, eyeMat);
    mouth.position.set(0, 0.9, 0.36);
    mouthRef.current = mouth;
    robotGroup.add(mouth);

    // 9. Legs & Hips
    const hipJointGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16);
    hipJointGeo.rotateZ(Math.PI / 2);
    const hip = new THREE.Mesh(hipJointGeo, jointMat);
    hip.position.y = -0.5;
    robotGroup.add(hip);

    const legGeo = new THREE.CapsuleGeometry(0.2, 0.7, 4, 12);
    const lLeg = new THREE.Mesh(legGeo, roboMat);
    lLeg.position.set(-0.35, -1.1, 0);
    robotGroup.add(lLeg);

    const rLeg = lLeg.clone();
    rLeg.position.x = 0.35;
    robotGroup.add(rLeg);

    // 10. Neptune Ring (Dekorasi Cincin)
    const ringGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    ringRef.current = ring;
    robotGroup.add(ring);

    scene.add(robotGroup);

    // --- ANIMATION LOOP ---
    let lastBlink = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Bobbing movement (Melayang halus)
      robotGroup.position.y = 0.8 + Math.sin(time * 1.2) * 0.1;

      // Ring rotation
      if (ringRef.current) ringRef.current.rotation.z += 0.01;

      // Mouth animation (Vocalizer effect)
      if (mouthRef.current) {
        const material = mouthRef.current.material;

        // Cek apakah material bukan array dan memiliki properti color
        if (mouthRef.current) {
          // Kita tegaskan bahwa material ini adalah tipe MeshBasicMaterial atau MeshStandardMaterial
          const material = mouthRef.current.material as THREE.MeshBasicMaterial;

          if (isSpeakingRef.current) {
            mouthRef.current.scale.y = 2 + Math.abs(Math.sin(time * 30)) * 8;
            material.color.setHex(0xffffff);
          } else {
            mouthRef.current.scale.y = 1;
            material.color.setHex(0x00f3ff);
          }
        }
      }

      // Blink animation
      if (time - lastBlink > 4 && Math.random() > 0.99) {
        [eyeLeftRef.current, eyeRightRef.current].forEach((e) => {
          if (e) e.scale.y = 0.1;
        });
        setTimeout(() => {
          [eyeLeftRef.current, eyeRightRef.current].forEach((e) => {
            if (e) e.scale.y = 1;
          });
        }, 120);
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
        body: JSON.stringify({
          prompt,
          history: [],
          mode: "Vanilla",
          isRocobot: true,
        }),
      });
      const data = await res.json();
      const aiText = data.text || "Maaf, ada kesalahan.";

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(aiText);
        const voices = speechSynthesis.getVoices();
        const defaultVoice = voices.find((v) => v.lang === "id-ID");
        if (defaultVoice) utterance.voice = defaultVoice;

        utterance.onstart = () => {
          isSpeakingRef.current = true;
        };
        utterance.onend = () => {
          isSpeakingRef.current = false;
        };
        utterance.onerror = () => {
          isSpeakingRef.current = false;
        };

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error(error);
      isSpeakingRef.current = false;
    }

    setPrompt("");
    setIsLoading(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020205]">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,243,255,0.05)_0%,_transparent_70%)]" />
      <div ref={mountRef} className="absolute inset-0" />

      <Link href="/">
        <button className="absolute top-6 left-6 z-20 px-5 py-2 bg-white/5 backdrop-blur-xl text-white rounded-full hover:bg-white/10 transition border border-white/10 text-xs font-bold tracking-widest uppercase">
          ← System Exit
        </button>
      </Link>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute -inset-1 bg-cyan-500/20 rounded-2xl blur-lg" />
          <div className="relative flex gap-3 items-center bg-black/40 backdrop-blur-3xl p-2 rounded-2xl border border-white/10">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Input Command for Rocobot..."
              disabled={isLoading || !voicesLoaded}
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-cyan-500/50 focus:outline-none text-sm font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !voicesLoaded}
              className="px-8 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 disabled:bg-gray-800 transition text-xs font-bold uppercase tracking-wider"
            >
              {isLoading ? "Processing..." : "Execute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RocobotPage;
