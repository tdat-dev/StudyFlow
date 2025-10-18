'use client';

import React from 'react';
import BossMechaDragon from './BossMechaDragon';

export default function BossMechaDragonDemo() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🐉 Boss Mecha Dragon Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cyberpunk mecha-dragon boss với Canvas 2D/3D animation system
          </p>
        </div>

        <BossMechaDragon />

        <div className="mt-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Tính năng chính
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                  🎬 Animation
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Sprite-sheet 4×3 frames</li>
                  <li>• FPS control (mặc định 9 FPS)</li>
                  <li>• Idle bob animation</li>
                  <li>• Single-frame fallback</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-green-600 dark:text-green-400">
                  ⚡ Hiệu ứng
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Flash trắng-xanh khi trúng đòn</li>
                  <li>• Camera shake (mạnh hơn khi crit)</li>
                  <li>• Floating damage numbers</li>
                  <li>• Particle effects (tia điện + dầu)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                  🎮 Gameplay
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• HP bar với gradient</li>
                  <li>• Attack / Crit / Heal / Reset</li>
                  <li>• Auto Attack toggle</li>
                  <li>• Max HP presets</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                  🔧 Kỹ thuật
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• TypeScript + TailwindCSS</li>
                  <li>• Canvas 2D responsive</li>
                  <li>• Three.js 3D mode</li>
                  <li>• Sanity Panel validation</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  🎨 Phong cách
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Cyberpunk mecha-dragon</li>
                  <li>• Cobalt/graphite kim loại</li>
                  <li>• Neon cyan/magenta</li>
                  <li>• Grid background</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">
                  ✅ Testing
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Sanity Panel PASS/FAIL</li>
                  <li>• Config validation</li>
                  <li>• Error handling</li>
                  <li>• No crash on invalid URL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
