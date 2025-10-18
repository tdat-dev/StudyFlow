'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import * as THREE from 'three';

// Types
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingDamage {
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

interface BossMechaDragonProps {
  className?: string;
}

interface SanityCheck {
  animMode: boolean;
  spriteUrl: boolean;
  colsRowsFps: boolean;
}

// Constants
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;
const DEFAULT_FPS = 9;
const DEFAULT_COLS = 4;
const DEFAULT_ROWS = 3;
const IDLE_BOB_AMPLITUDE = 2;
const IDLE_BOB_SPEED = 0.02;

// Helper functions
const createParticle = (
  x: number,
  y: number,
  type: 'spark' | 'oil',
): Particle => ({
  x,
  y,
  vx: (Math.random() - 0.5) * 4,
  vy: Math.random() * 3 + 1,
  life: 1,
  maxLife: 1,
  color: type === 'spark' ? '#00ffff' : '#8b0000',
  size: type === 'spark' ? 2 : 3,
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
  vx: (Math.random() - 0.5) * 2,
  vy: -2 - Math.random() * 2,
});

const drawHPBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  current: number,
  max: number,
) => {
  const percentage = current / max;

  // Background
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x, y, width, height);

  // Border
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Health bar
  const healthWidth = width * percentage;
  const gradient = ctx.createLinearGradient(x, y, x + healthWidth, y);

  if (percentage > 0.6) {
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(1, '#00cc66');
  } else if (percentage > 0.3) {
    gradient.addColorStop(0, '#ffaa00');
    gradient.addColorStop(1, '#ff8800');
  } else {
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(1, '#cc2222');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(x + 2, y + 2, healthWidth - 4, height - 4);

  // Neon outline
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, healthWidth - 2, height - 2);
};

const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
) => {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size,
    );
    ctx.restore();
  });
};

const drawFloatingDamage = (
  ctx: CanvasRenderingContext2D,
  floatingDamages: FloatingDamage[],
) => {
  floatingDamages.forEach(damage => {
    const alpha = damage.life / damage.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = damage.isCrit ? '#ffdd00' : '#ffffff';
    ctx.strokeStyle = damage.isCrit ? '#ff8800' : '#000000';
    ctx.lineWidth = 2;

    const text = `-${damage.value}`;
    const metrics = ctx.measureText(text);
    const textX = damage.x - metrics.width / 2;
    const textY = damage.y;

    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);
    ctx.restore();
  });
};

export default function BossMechaDragon({
  className = '',
}: BossMechaDragonProps) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bossMeshRef = useRef<THREE.Mesh | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  // State
  const [spriteUrl, setSpriteUrl] = useState('/boss.png');
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [maxHp, setMaxHp] = useState(1000);
  const [currentHp, setCurrentHp] = useState(1000);
  const [isAutoAttack, setIsAutoAttack] = useState(false);
  const [use3D, setUse3D] = useState(false);

  // Animation state
  const [currentFrame, setCurrentFrame] = useState(0);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);

  // Effects state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [idleOffset, setIdleOffset] = useState(0);

  // Sanity check state
  const [sanityCheck, setSanityCheck] = useState<SanityCheck>({
    animMode: false,
    spriteUrl: false,
    colsRowsFps: false,
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!use3D || !threeContainerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      CANVAS_WIDTH / CANVAS_HEIGHT,
      0.1,
      1000,
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Clock
    clockRef.current = new THREE.Clock();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 20, 0x333333, 0x333333);
    scene.add(gridHelper);

    return () => {
      const container = threeContainerRef.current;
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.dispose();
      }
      if (container && renderer) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [use3D]);

  // Create 3D boss mesh
  const create3DBoss = useCallback(
    (img: HTMLImageElement) => {
      if (!sceneRef.current || !cameraRef.current) return;

      // Remove existing boss mesh
      if (bossMeshRef.current) {
        sceneRef.current.remove(bossMeshRef.current);
      }

      // Create texture
      const texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Create sprite sheet texture
      const spriteTexture = new THREE.Texture(img);
      spriteTexture.needsUpdate = true;
      spriteTexture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Calculate UV coordinates for current frame
      const frameWidth = 1 / cols;
      const frameHeight = 1 / rows;
      const frameX = (currentFrame % cols) * frameWidth;
      const frameY = 1 - (Math.floor(currentFrame / cols) + 1) * frameHeight;

      // Update UV coordinates
      const geometry = new THREE.PlaneGeometry(4, 4);
      const uvAttribute = geometry.attributes.uv;
      const uvArray = uvAttribute.array as Float32Array;

      // Set UV coordinates for the current frame
      uvArray[0] = frameX; // bottom-left
      uvArray[1] = frameY;
      uvArray[2] = frameX + frameWidth; // bottom-right
      uvArray[3] = frameY;
      uvArray[4] = frameX; // top-left
      uvArray[5] = frameY + frameHeight;
      uvArray[6] = frameX + frameWidth; // top-right
      uvArray[7] = frameY + frameHeight;

      uvAttribute.needsUpdate = true;

      // Create material with cyberpunk effects
      const material = new THREE.MeshBasicMaterial({
        map: spriteTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      // Add emissive glow effect (unused for now)
      // const emissiveMaterial = new THREE.MeshLambertMaterial({
      //   map: spriteTexture,
      //   transparent: true,
      //   side: THREE.DoubleSide,
      //   emissive: new THREE.Color(0x00ffff),
      //   emissiveIntensity: 0.2,
      // });

      // Create mesh
      const bossMesh = new THREE.Mesh(geometry, material);
      bossMesh.position.set(0, 0, 0);
      bossMeshRef.current = bossMesh;
      sceneRef.current.add(bossMesh);

      // Add neon outline
      const outlineGeometry = new THREE.PlaneGeometry(4.1, 4.1);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      });
      const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outlineMesh.position.z = -0.01;
      sceneRef.current.add(outlineMesh);
    },
    [currentFrame, cols, rows],
  );

  // Load sprite image
  useEffect(() => {
    if (!spriteUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSpriteImage(img);
      setIsLoaded(true);

      // Create 3D texture if in 3D mode
      if (use3D && sceneRef.current) {
        create3DBoss(img);
      }
    };
    img.onerror = () => {
      console.warn('Failed to load sprite image');
      setIsLoaded(false);
    };
    img.src = spriteUrl;
  }, [spriteUrl, use3D, create3DBoss]);

  // 3D Animation loop
  useEffect(() => {
    if (
      !use3D ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;

      const clock = clockRef.current;
      if (clock) {
        const elapsedTime = clock.getElapsedTime();

        // Idle bob animation
        if (bossMeshRef.current) {
          bossMeshRef.current.position.y = Math.sin(elapsedTime * 2) * 0.1;
          bossMeshRef.current.rotation.z = Math.sin(elapsedTime * 1.5) * 0.05;
        }

        // Shake effect
        if (shakeIntensity > 0) {
          cameraRef.current.position.x =
            (Math.random() - 0.5) * shakeIntensity * 0.01;
          cameraRef.current.position.y =
            (Math.random() - 0.5) * shakeIntensity * 0.01;
        } else {
          cameraRef.current.position.x = 0;
          cameraRef.current.position.y = 0;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [use3D, shakeIntensity]);

  // Update 3D boss when frame changes
  useEffect(() => {
    if (use3D && spriteImage && sceneRef.current) {
      create3DBoss(spriteImage);
    }
  }, [use3D, spriteImage, currentFrame, create3DBoss]);

  // Sanity check
  useEffect(() => {
    const check = {
      animMode: cols > 1 || rows > 1,
      spriteUrl: spriteUrl.trim().length > 0,
      colsRowsFps: cols >= 1 && rows >= 1 && fps >= 1,
    };
    setSanityCheck(check);
  }, [spriteUrl, cols, rows, fps]);

  // Animation loop (2D only)
  useEffect(() => {
    if (!isLoaded || !spriteImage || use3D) return;

    const animate = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Calculate frame
      const frameInterval = 1000 / fps;
      if (currentTime - lastFrameTime >= frameInterval) {
        const totalFrames = cols * rows;
        setCurrentFrame(prev => (prev + 1) % totalFrames);
        setLastFrameTime(currentTime);
      }

      // Update idle bob
      setIdleOffset(
        Math.sin(currentTime * IDLE_BOB_SPEED) * IDLE_BOB_AMPLITUDE,
      );

      // Update particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0),
      );

      // Update floating damage
      setFloatingDamages(prev =>
        prev
          .map(fd => ({
            ...fd,
            x: fd.x + fd.vx,
            y: fd.y + fd.vy,
            life: fd.life - 0.01,
          }))
          .filter(fd => fd.life > 0),
      );

      // Update shake
      if (shakeIntensity > 0) {
        setShakeIntensity(prev => Math.max(0, prev - 0.1));
      }

      // Update flash
      if (isFlashing) {
        setIsFlashing(false);
      }

      // Draw background grid
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Calculate sprite position
      const frameX = (currentFrame % cols) * 256;
      const frameY = Math.floor(currentFrame / cols) * 256;

      // Apply shake
      const shakeX = (Math.random() - 0.5) * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * shakeIntensity;

      // Draw sprite
      const spriteX = CANVAS_WIDTH / 2 - 128 + shakeX;
      const spriteY = CANVAS_HEIGHT / 2 - 128 + idleOffset + shakeY;

      ctx.save();

      // Flash effect
      if (isFlashing) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(spriteX - 10, spriteY - 10, 276, 276);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw sprite frame
      ctx.drawImage(
        spriteImage,
        frameX,
        frameY,
        256,
        256,
        spriteX,
        spriteY,
        256,
        256,
      );

      ctx.restore();

      // Draw particles
      drawParticles(ctx, particles);

      // Draw floating damage
      drawFloatingDamage(ctx, floatingDamages);

      // Draw HP bar
      drawHPBar(ctx, 20, 20, CANVAS_WIDTH - 40, 20, currentHp, maxHp);

      // Draw HP text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`HP: ${currentHp}/${maxHp}`, 20, 50);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isLoaded,
    spriteImage,
    currentFrame,
    lastFrameTime,
    fps,
    cols,
    rows,
    particles,
    floatingDamages,
    isFlashing,
    shakeIntensity,
    idleOffset,
    currentHp,
    maxHp,
    use3D,
  ]);

  // Attack function
  const attack = useCallback((damage: number, isCrit: boolean = false) => {
    setCurrentHp(prev => Math.max(0, prev - damage));

    // Flash effect
    setIsFlashing(true);

    // Shake effect
    setShakeIntensity(isCrit ? 8 : 4);

    // Floating damage
    const newFloatingDamage = createFloatingDamage(
      CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 100,
      CANVAS_HEIGHT / 2 - 50,
      damage,
      isCrit,
    );
    setFloatingDamages(prev => [...prev, newFloatingDamage]);

    // Particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < (isCrit ? 15 : 8); i++) {
      newParticles.push(
        createParticle(
          CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 100,
          CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
          'spark',
        ),
      );
    }
    for (let i = 0; i < (isCrit ? 5 : 3); i++) {
      newParticles.push(
        createParticle(
          CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 100,
          CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
          'oil',
        ),
      );
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Auto attack effect
  useEffect(() => {
    if (!isAutoAttack) return;

    const interval = setInterval(() => {
      const damage = Math.floor(Math.random() * 50) + 10;
      attack(damage, false);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoAttack, attack]);

  // UI handlers
  const handleAttack = () => {
    const damage = Math.floor(Math.random() * 100) + 20;
    attack(damage, false);
  };

  const handleCrit = () => {
    const damage = Math.floor(Math.random() * 200) + 100;
    attack(damage, true);
  };

  const handleHeal = () => {
    setCurrentHp(prev => Math.min(maxHp, prev + 200));
  };

  const handleReset = () => {
    setCurrentHp(maxHp);
    setParticles([]);
    setFloatingDamages([]);
    setIsFlashing(false);
    setShakeIntensity(0);
  };

  const handleMaxHpChange = (newMaxHp: number) => {
    setMaxHp(newMaxHp);
    setCurrentHp(newMaxHp);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${className}`}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🐉 Boss Mecha Dragon
            <Badge
              variant={
                sanityCheck.animMode &&
                sanityCheck.spriteUrl &&
                sanityCheck.colsRowsFps
                  ? 'default'
                  : 'destructive'
              }
            >
              {sanityCheck.animMode &&
              sanityCheck.spriteUrl &&
              sanityCheck.colsRowsFps
                ? 'PASS'
                : 'FAIL'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sprite Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="spriteUrl">Sprite URL</Label>
              <Input
                id="spriteUrl"
                value={spriteUrl}
                onChange={e => setSpriteUrl(e.target.value)}
                placeholder="URL to sprite sheet"
              />
            </div>
            <div>
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                value={cols}
                onChange={e => setCols(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                value={rows}
                onChange={e => setRows(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="fps">FPS</Label>
              <Input
                id="fps"
                type="number"
                min="1"
                value={fps}
                onChange={e => setFps(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Max HP Presets */}
          <div className="flex flex-wrap gap-2">
            <Label className="self-center">Max HP:</Label>
            {[500, 1000, 2000, 5000].map(hp => (
              <Button
                key={hp}
                variant={maxHp === hp ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMaxHpChange(hp)}
              >
                {hp}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAttack} disabled={currentHp <= 0}>
              Attack
            </Button>
            <Button
              onClick={handleCrit}
              disabled={currentHp <= 0}
              variant="destructive"
            >
              Crit
            </Button>
            <Button onClick={handleHeal} disabled={currentHp <= 0}>
              Heal
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="autoAttack"
                checked={isAutoAttack}
                onCheckedChange={setIsAutoAttack}
              />
              <Label htmlFor="autoAttack">Auto Attack</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="use3D" checked={use3D} onCheckedChange={setUse3D} />
              <Label htmlFor="use3D">3D Mode</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center">
            {use3D ? (
              <div
                ref={threeContainerRef}
                className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden boss-3d-container"
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 boss-canvas"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sanity Panel */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sanity Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={sanityCheck.animMode ? 'default' : 'destructive'}>
                {sanityCheck.animMode ? 'PASS' : 'FAIL'}
              </Badge>
              <span>Animation Mode (cols &gt; 1 || rows &gt; 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={sanityCheck.spriteUrl ? 'default' : 'destructive'}
              >
                {sanityCheck.spriteUrl ? 'PASS' : 'FAIL'}
              </Badge>
              <span>Sprite URL not empty</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={sanityCheck.colsRowsFps ? 'default' : 'destructive'}
              >
                {sanityCheck.colsRowsFps ? 'PASS' : 'FAIL'}
              </Badge>
              <span>Cols/Rows/FPS &ge; 1</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
