'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type * as THREE from 'three';

// Types
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface FloatingDamage {
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  life: number;
  maxLife: number;
}

interface BossBattleCanvasProps {
  spriteUrl?: string;
  cols?: number;
  rows?: number;
  fps?: number;
  use3D?: boolean;
  maxHp?: number;
  className?: string;
}

// Helper functions
const createParticle = (x: number, y: number): Particle => ({
  x,
  y,
  vx: (Math.random() - 0.5) * 4,
  vy: Math.random() * -3 - 1,
  life: 1,
  maxLife: 1,
  color: `hsl(${Math.random() * 20 + 340}, 70%, 50%)`,
});

const createFloatingDamage = (
  x: number,
  y: number,
  value: number,
  isCrit: boolean,
): FloatingDamage => ({
  x,
  y,
  value,
  isCrit,
  life: 1,
  maxLife: 1,
});

const updateParticles = (
  particles: Particle[],
  deltaTime: number,
): Particle[] => {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * deltaTime,
      y: p.y + p.vy * deltaTime,
      vy: p.vy + 0.5 * deltaTime, // gravity
      life: p.life - deltaTime * 2,
    }))
    .filter(p => p.life > 0);
};

const updateFloatingDamage = (
  floatingDamages: FloatingDamage[],
  deltaTime: number,
): FloatingDamage[] => {
  return floatingDamages
    .map(fd => ({
      ...fd,
      y: fd.y - 30 * deltaTime,
      life: fd.life - deltaTime * 2,
    }))
    .filter(fd => fd.life > 0);
};

// 2D Canvas helpers
const drawHPBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  current: number,
  max: number,
) => {
  const ratio = current / max;

  // Background
  ctx.fillStyle = '#374151';
  ctx.fillRect(x, y, width, height);

  // Health bar
  ctx.fillStyle = ratio > 0.3 ? '#10b981' : '#ef4444';
  ctx.fillRect(x, y, width * ratio, height);

  // Border
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${Math.round(current)}/${max}`,
    x + width / 2,
    y + height / 2 + 5,
  );
};

const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
) => {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

const drawFloatingDamage = (
  ctx: CanvasRenderingContext2D,
  floatingDamages: FloatingDamage[],
) => {
  floatingDamages.forEach(fd => {
    ctx.save();
    ctx.globalAlpha = fd.life;
    ctx.fillStyle = fd.isCrit ? '#fbbf24' : '#ffffff';
    ctx.font = fd.isCrit ? 'bold 20px Arial' : '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(fd.value.toString(), fd.x, fd.y);
    ctx.restore();
  });
};

// 3D helpers
const createSpriteTexture = (
  THREE: typeof import('three'),
  image: HTMLImageElement,
  cols: number,
  rows: number,
  frame: number,
): THREE.Texture => {
  const texture = new THREE.Texture(image);
  const frameWidth = 1 / cols;
  const frameHeight = 1 / rows;
  const frameX = (frame % cols) * frameWidth;
  const frameY = Math.floor(frame / cols) * frameHeight;

  texture.offset.set(frameX, frameY);
  texture.repeat.set(frameWidth, frameHeight);
  texture.needsUpdate = true;

  return texture;
};

// Main component
export default function BossBattleCanvas({
  spriteUrl = '/public/boss.png',
  cols = 1,
  rows = 1,
  fps = 10,
  use3D = false,
  maxHp = 1000,
  className = '',
}: BossBattleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const [hp, setHp] = useState(maxHp);
  const [isAutoAttack, setIsAutoAttack] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [cameraShake, setCameraShake] = useState(0);
  const [hitFlash, setHitFlash] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);

  // Validation state
  const [validation, setValidation] = useState({
    animMode: false,
    spriteUrlValid: false,
    spriteSheetValid: false,
  });

  // Load sprite image
  useEffect(() => {
    if (!spriteUrl) return;

    const img = new Image();
    img.onload = () => {
      setSpriteImage(img);
    };
    img.onerror = () => {
      // Handle error silently
    };
    img.src = spriteUrl;
  }, [spriteUrl]);

  // Validation
  useEffect(() => {
    setValidation({
      animMode: use3D || cols > 1 || rows > 1,
      spriteUrlValid: !!spriteUrl && spriteUrl.trim() !== '',
      spriteSheetValid: cols >= 1 && rows >= 1 && fps >= 1,
    });
  }, [spriteUrl, cols, rows, fps, use3D]);

  // Animation frame update
  const updateFrame = useCallback(() => {
    if (cols > 1 || rows > 1) {
      setCurrentFrame(prev => (prev + 1) % (cols * rows));
    }
  }, [cols, rows]);

  // Attack function
  const attack = useCallback(() => {
    const damage = Math.random() * 100 + 50;
    const isCrit = Math.random() < 0.1;
    const finalDamage = isCrit ? damage * 2 : damage;

    setHp(prev => Math.max(0, prev - finalDamage));

    // Add particles
    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 5 }, () => createParticle(360, 210)),
    ]);

    // Add floating damage
    setFloatingDamages(prev => [
      ...prev,
      createFloatingDamage(360, 210, Math.round(finalDamage), isCrit),
    ]);

    // Camera shake
    setCameraShake(10);

    // Hit flash
    setHitFlash(1);
  }, []);

  // Auto attack
  useEffect(() => {
    if (!isAutoAttack) return;

    const interval = setInterval(() => {
      attack();
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoAttack, attack]);

  const critAttack = useCallback(() => {
    const damage = Math.random() * 200 + 100;
    setHp(prev => Math.max(0, prev - damage));

    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 8 }, () => createParticle(360, 210)),
    ]);
    setFloatingDamages(prev => [
      ...prev,
      createFloatingDamage(360, 210, Math.round(damage), true),
    ]);
    setCameraShake(15);
    setHitFlash(1);
  }, []);

  const heal = useCallback(() => {
    const healAmount = Math.random() * 200 + 100;
    setHp(prev => Math.min(maxHp, prev + healAmount));
  }, [maxHp]);

  const reset = useCallback(() => {
    setHp(maxHp);
    setParticles([]);
    setFloatingDamages([]);
    setCameraShake(0);
    setHitFlash(0);
  }, [maxHp]);

  // 2D Canvas rendering
  useEffect(() => {
    if (use3D || !canvasRef.current || !spriteImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let frameTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      frameTime += deltaTime;

      // Update frame animation
      if (frameTime >= 1 / fps) {
        updateFrame();
        frameTime = 0;
      }

      // Update particles
      setParticles(prev => updateParticles(prev, deltaTime));
      setFloatingDamages(prev => updateFloatingDamage(prev, deltaTime));

      // Update camera shake
      setCameraShake(prev => Math.max(0, prev - deltaTime * 20));
      setHitFlash(prev => Math.max(0, prev - deltaTime * 5));

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply camera shake
      const shakeX = (Math.random() - 0.5) * cameraShake;
      const shakeY = (Math.random() - 0.5) * cameraShake;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Draw background
      ctx.fillStyle = hitFlash > 0 ? '#ff0000' : '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sprite
      if (spriteImage) {
        const frameWidth = spriteImage.width / cols;
        const frameHeight = spriteImage.height / rows;
        const frameX = (currentFrame % cols) * frameWidth;
        const frameY = Math.floor(currentFrame / cols) * frameHeight;

        ctx.drawImage(
          spriteImage,
          frameX,
          frameY,
          frameWidth,
          frameHeight,
          200,
          100,
          320,
          240,
        );
      }

      // Draw HP bar
      drawHPBar(ctx, 50, 50, 300, 30, hp, maxHp);

      // Draw particles
      drawParticles(ctx, particles);

      // Draw floating damage
      drawFloatingDamage(ctx, floatingDamages);

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    use3D,
    spriteImage,
    cols,
    rows,
    fps,
    currentFrame,
    particles,
    floatingDamages,
    cameraShake,
    hitFlash,
    hp,
    maxHp,
    updateFrame,
  ]);

  // 3D Three.js rendering (dynamic import)
  useEffect(() => {
    if (!use3D || !threeRef.current || !spriteImage) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 720 / 420, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });

      renderer.setSize(720, 420);
      renderer.setClearColor(0x1f2937);
      threeRef.current?.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(4, 3);
      const texture = createSpriteTexture(
        THREE,
        spriteImage,
        cols,
        rows,
        currentFrame,
      );
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);

      scene.add(mesh);
      camera.position.z = 5;

      let lastTime = 0;
      let frameTime = 0;
      let idleTime = 0;

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        frameTime += deltaTime;
        idleTime += deltaTime;

        if (frameTime >= 1 / fps) {
          updateFrame();
          frameTime = 0;

          const newTexture = createSpriteTexture(
            THREE,
            spriteImage,
            cols,
            rows,
            currentFrame,
          );
          (material as any).map = newTexture;
          (material as any).needsUpdate = true;
        }

        mesh.position.y = Math.sin(idleTime * 2) * 0.1;

        if (cameraShake > 0) {
          camera.position.x = (Math.random() - 0.5) * cameraShake * 0.1;
          camera.position.y = (Math.random() - 0.5) * cameraShake * 0.1;
          setCameraShake(prev => Math.max(0, prev - deltaTime * 20));
        } else {
          camera.position.x = 0;
          camera.position.y = 0;
        }

        renderer.render(scene, camera);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      cleanup = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (threeRef.current && renderer.domElement) {
          threeRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometry.dispose();
        (material as any).dispose?.();
        (texture as any).dispose?.();
      };
    })();

    return () => {
      cleanup?.();
    };
  }, [
    use3D,
    spriteImage,
    cols,
    rows,
    fps,
    currentFrame,
    cameraShake,
    updateFrame,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={attack}
          disabled={hp <= 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
        >
          Attack
        </button>
        <button
          onClick={critAttack}
          disabled={hp <= 0}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
        >
          Crit (100%)
        </button>
        <button
          onClick={heal}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Heal
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setIsAutoAttack(!isAutoAttack)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isAutoAttack
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
        >
          Auto Attack {isAutoAttack ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative border-2 border-gray-600 rounded-lg overflow-hidden">
        {use3D ? (
          <div ref={threeRef} className="w-[720px] h-[420px]" />
        ) : (
          <canvas ref={canvasRef} width={720} height={420} className="block" />
        )}
      </div>

      {/* HP Display */}
      <div className="text-center">
        <div className="text-lg font-bold text-white">
          HP: {Math.round(hp)} / {maxHp}
        </div>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              hp / maxHp > 0.3 ? 'bg-green-500' : 'bg-red-500'
            }`}
            // eslint-disable-next-line react/forbid-dom-props
            style={{ width: `${(hp / maxHp) * 100}%` }}
            aria-label={`Health bar at ${Math.round((hp / maxHp) * 100)}%`}
          />
        </div>
      </div>

      {/* Validation Panel */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg text-sm">
        <h3 className="text-white font-bold mb-2">Runtime Tests</h3>
        <div className="space-y-1">
          <div
            className={`flex items-center gap-2 ${validation.animMode ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{validation.animMode ? '✓' : '✗'}</span>
            <span>Animation Mode: {validation.animMode ? 'PASS' : 'FAIL'}</span>
          </div>
          <div
            className={`flex items-center gap-2 ${validation.spriteUrlValid ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{validation.spriteUrlValid ? '✓' : '✗'}</span>
            <span>
              Sprite URL: {validation.spriteUrlValid ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${validation.spriteSheetValid ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{validation.spriteSheetValid ? '✓' : '✗'}</span>
            <span>
              Sprite Sheet: {validation.spriteSheetValid ? 'PASS' : 'FAIL'}
            </span>
          </div>
        </div>
      </div>

      {/* Sprite Configuration */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white font-bold mb-2">Sprite Configuration</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Sprite URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spriteUrl}
                onChange={() => {
                  /* Handle URL change */
                }}
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                placeholder="Enter sprite URL"
                aria-label="Sprite URL input"
                title="Enter the URL of your sprite image"
              />
              <button
                onClick={() => {
                  /* Set to /public/boss.png */
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Use /public/boss.png
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Cols:</label>
              <input
                type="number"
                value={cols}
                onChange={() => {
                  /* Handle cols change */
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                aria-label="Number of columns in sprite sheet"
                title="Number of columns in sprite sheet"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Rows:</label>
              <input
                type="number"
                value={rows}
                onChange={() => {
                  /* Handle rows change */
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                aria-label="Number of rows in sprite sheet"
                title="Number of rows in sprite sheet"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">FPS:</label>
              <input
                type="number"
                value={fps}
                onChange={() => {
                  /* Handle fps change */
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                aria-label="Animation frames per second"
                title="Animation frames per second"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
