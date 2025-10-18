'use client';

import React, { useState } from 'react';
import BossBattleCanvas from './BossBattleCanvas';

export default function BossBattleDemo() {
  const [spriteUrl, setSpriteUrl] = useState('/public/boss.png');
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(2);
  const [fps, setFps] = useState(8);
  const [use3D, setUse3D] = useState(false);
  const [maxHp, setMaxHp] = useState(1000);

  const hpPresets = [500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Boss Battle Canvas Demo
        </h1>

        {/* Configuration Panel */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sprite URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sprite URL
              </label>
              <input
                type="text"
                value={spriteUrl}
                onChange={e => setSpriteUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter sprite URL"
              />
              <button
                onClick={() => setSpriteUrl('/public/boss.png')}
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Use Default
              </button>
            </div>

            {/* Sprite Sheet Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sprite Sheet
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cols}
                    onChange={e => setCols(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                    placeholder="Cols"
                    min="1"
                  />
                  <span className="text-gray-300 self-center">×</span>
                  <input
                    type="number"
                    value={rows}
                    onChange={e => setRows(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                    placeholder="Rows"
                    min="1"
                  />
                </div>
                <input
                  type="number"
                  value={fps}
                  onChange={e => setFps(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                  placeholder="FPS"
                  min="1"
                />
              </div>
            </div>

            {/* 3D Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rendering Mode
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!use3D}
                    onChange={() => setUse3D(false)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">2D Canvas</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={use3D}
                    onChange={() => setUse3D(true)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">3D Three.js</span>
                </label>
              </div>
            </div>

            {/* HP Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max HP Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {hpPresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setMaxHp(preset)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      maxHp === preset
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Boss Battle Canvas */}
        <BossBattleCanvas
          spriteUrl={spriteUrl}
          cols={cols}
          rows={rows}
          fps={fps}
          use3D={use3D}
          maxHp={maxHp}
          className="mb-8"
        />

        {/* Instructions */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Controls
              </h3>
              <ul className="space-y-1">
                <li>
                  • <strong>Attack:</strong> Deal random damage (50-150)
                </li>
                <li>
                  • <strong>Crit:</strong> Guaranteed critical hit (100-300
                  damage)
                </li>
                <li>
                  • <strong>Heal:</strong> Restore 100-300 HP
                </li>
                <li>
                  • <strong>Reset:</strong> Reset boss to full health
                </li>
                <li>
                  • <strong>Auto Attack:</strong> Automatically attack every
                  second
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Features
              </h3>
              <ul className="space-y-1">
                <li>
                  • <strong>Sprite Animation:</strong> Support for sprite sheets
                </li>
                <li>
                  • <strong>Particle Effects:</strong> Blood particles on hit
                </li>
                <li>
                  • <strong>Floating Damage:</strong> Yellow for crits, white
                  for normal
                </li>
                <li>
                  • <strong>Camera Shake:</strong> Screen shake on impact
                </li>
                <li>
                  • <strong>Hit Flash:</strong> Red screen flash on damage
                </li>
                <li>
                  • <strong>3D Mode:</strong> Optional Three.js rendering with
                  idle bob
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
