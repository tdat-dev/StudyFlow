'use client';

import React from 'react';
import BossBattleCanvas from './BossBattleCanvas';

/**
 * Example usage of BossBattleCanvas component
 *
 * This component demonstrates how to use the BossBattleCanvas with different configurations:
 * - 2D Canvas mode with sprite sheet animation
 * - 3D Three.js mode with texture mapping
 * - Different HP presets and sprite configurations
 */
export default function BossBattleExample() {
  return (
    <div className="space-y-8">
      {/* Basic 2D Canvas Example */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">2D Canvas Mode</h2>
        <BossBattleCanvas
          spriteUrl="/public/boss.png"
          cols={4}
          rows={2}
          fps={8}
          use3D={false}
          maxHp={1000}
        />
      </div>

      {/* 3D Three.js Example */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">3D Three.js Mode</h2>
        <BossBattleCanvas
          spriteUrl="/public/boss.png"
          cols={4}
          rows={2}
          fps={8}
          use3D={true}
          maxHp={2000}
        />
      </div>

      {/* Single Sprite Example */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Single Sprite (No Animation)
        </h2>
        <BossBattleCanvas
          spriteUrl="/public/boss.png"
          cols={1}
          rows={1}
          fps={1}
          use3D={false}
          maxHp={500}
        />
      </div>
    </div>
  );
}
