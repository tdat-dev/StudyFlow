import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  RotateCcw,
  Play,
} from 'lucide-react';

interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    pomodoroTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    soundEnabled: boolean;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    notificationsEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export function PomodoroSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: PomodoroSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  // Đồng bộ localSettings khi settings prop thay đổi (khi modal mở lại)
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      soundEnabled: true,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notificationsEnabled: true,
    };
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-studyflow-surface rounded-2xl shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Cài đặt Pomodoro
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timer Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Thời gian
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="pomodoro-time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Pomodoro (phút)
                  </label>
                  <input
                    id="pomodoro-time"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.pomodoroTime}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        pomodoroTime: parseInt(e.target.value) || 25,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="short-break-time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nghỉ ngắn (phút)
                  </label>
                  <input
                    id="short-break-time"
                    type="number"
                    min="1"
                    max="30"
                    value={localSettings.shortBreakTime}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        shortBreakTime: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="long-break-time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nghỉ dài (phút)
                  </label>
                  <input
                    id="long-break-time"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.longBreakTime}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        longBreakTime: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Sound Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                {localSettings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 mr-2" />
                ) : (
                  <VolumeX className="w-5 h-5 mr-2" />
                )}
                Âm thanh
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="sound-enabled"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bật âm thanh thông báo
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Phát âm thanh khi hết thời gian
                  </p>
                </div>
                <input
                  id="sound-enabled"
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={e =>
                    setLocalSettings({
                      ...localSettings,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Auto Start Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Tự động
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="auto-start-breaks"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tự động bắt đầu nghỉ
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tự động chuyển sang nghỉ khi hết Pomodoro
                    </p>
                  </div>
                  <input
                    id="auto-start-breaks"
                    type="checkbox"
                    checked={localSettings.autoStartBreaks}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        autoStartBreaks: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="auto-start-pomodoros"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tự động bắt đầu Pomodoro
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tự động bắt đầu Pomodoro khi hết nghỉ
                    </p>
                  </div>
                  <input
                    id="auto-start-pomodoros"
                    type="checkbox"
                    checked={localSettings.autoStartPomodoros}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        autoStartPomodoros: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                {localSettings.notificationsEnabled ? (
                  <Bell className="w-5 h-5 mr-2" />
                ) : (
                  <BellOff className="w-5 h-5 mr-2" />
                )}
                Thông báo
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="notifications-enabled"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bật thông báo desktop
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị thông báo khi hết thời gian
                  </p>
                </div>
                <input
                  id="notifications-enabled"
                  type="checkbox"
                  checked={localSettings.notificationsEnabled}
                  onChange={e =>
                    setLocalSettings({
                      ...localSettings,
                      notificationsEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
