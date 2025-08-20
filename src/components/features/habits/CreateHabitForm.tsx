import React, { useState } from 'react';
import Button from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  BookOpen,
  Headphones,
  Dumbbell,
  Coffee,
  Moon,
  Heart,
  Brain,
  Target,
  Clock,
  Zap,
  Smile,
  Star,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { generateTutorResponse } from '../../../services/ai';

interface CreateHabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateHabit: (habit: {
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    textColor: string;
  }) => void;
  loading?: boolean;
}

const HABIT_ICONS = [
  { icon: BookOpen, name: 'Học tập', color: 'blue' },
  { icon: Headphones, name: 'Nghe nhạc', color: 'green' },
  { icon: Dumbbell, name: 'Tập thể dục', color: 'red' },
  { icon: Coffee, name: 'Uống nước', color: 'amber' },
  { icon: Moon, name: 'Ngủ sớm', color: 'purple' },
  { icon: Heart, name: 'Sức khỏe', color: 'pink' },
  { icon: Brain, name: 'Tư duy', color: 'indigo' },
  { icon: Target, name: 'Mục tiêu', color: 'orange' },
  { icon: Clock, name: 'Thời gian', color: 'gray' },
  { icon: Zap, name: 'Năng lượng', color: 'yellow' },
  { icon: Smile, name: 'Hạnh phúc', color: 'emerald' },
  { icon: Star, name: 'Thành tựu', color: 'violet' },
];

const COLOR_THEMES = {
  blue: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-600 dark:text-green-400',
  },
  red: {
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    textColor: 'text-red-600 dark:text-red-400',
  },
  amber: {
    color: 'bg-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  purple: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  pink: {
    color: 'bg-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  indigo: {
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  orange: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  gray: {
    color: 'bg-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-900/50',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
  yellow: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    textColor: 'text-yellow-600 dark:text-yellow-400',
  },
  emerald: {
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    color: 'bg-violet-500',
    bgColor: 'bg-violet-100 dark:bg-violet-900/50',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
};

export function CreateHabitForm({
  open,
  onOpenChange,
  onCreateHabit,
  loading = false,
}: CreateHabitFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const colorTheme = COLOR_THEMES[selectedIcon.color as keyof typeof COLOR_THEMES];
    
    onCreateHabit({
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon.icon,
      ...colorTheme,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedIcon(HABIT_ICONS[0]);
    setAiPrompt('');
    setShowAIForm(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAI(true);
    try {
      const prompt = `Tôi muốn tạo một thói quen học tập mới. Mục tiêu của tôi là: "${aiPrompt}".

Hãy đề xuất cho tôi:
1. Tên thói quen (ngắn gọn, dưới 30 ký tự)
2. Mô tả chi tiết thói quen (dưới 100 ký tự)
3. Loại icon phù hợp (chọn từ: học tập, nghe nhạc, tập thể dục, uống nước, ngủ sớm, sức khỏe, tư duy, mục tiêu, thời gian, năng lượng, hạnh phúc, thành tựu)

Trả lời theo định dạng:
Tên: [tên thói quen]
Mô tả: [mô tả chi tiết]
Icon: [loại icon]`;

      const response = await generateTutorResponse(prompt, []);
      
      // Parse AI response
      const lines = response.split('\n');
      let aiTitle = '';
      let aiDescription = '';
      let aiIconType = '';

      lines.forEach(line => {
        if (line.startsWith('Tên:')) {
          aiTitle = line.replace('Tên:', '').trim();
        } else if (line.startsWith('Mô tả:')) {
          aiDescription = line.replace('Mô tả:', '').trim();
        } else if (line.startsWith('Icon:')) {
          aiIconType = line.replace('Icon:', '').trim().toLowerCase();
        }
      });

      // Map AI icon type to our icons
      const iconMapping: { [key: string]: number } = {
        'học tập': 0,
        'nghe nhạc': 1,
        'tập thể dục': 2,
        'uống nước': 3,
        'ngủ sớm': 4,
        'sức khỏe': 5,
        'tư duy': 6,
        'mục tiêu': 7,
        'thời gian': 8,
        'năng lượng': 9,
        'hạnh phúc': 10,
        'thành tựu': 11,
      };

      const iconIndex = iconMapping[aiIconType] || 0;

      if (aiTitle) setTitle(aiTitle);
      if (aiDescription) setDescription(aiDescription);
      setSelectedIcon(HABIT_ICONS[iconIndex]);
      setShowAIForm(false);
    } catch (error) {
      console.error('Error generating AI habit:', error);
      // Fallback suggestions
      setTitle('Thói quen học tập mới');
      setDescription('Thực hiện hoạt động học tập đều đặn mỗi ngày');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Tạo thói quen mới
          </DialogTitle>
          <DialogDescription>
            Tạo thói quen học tập mới để theo dõi tiến trình của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Generation Toggle */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={!showAIForm ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAIForm(false)}
              className={`flex-1 font-medium ${!showAIForm 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                : 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Tạo thủ công
            </Button>
            <Button
              type="button"
              variant={showAIForm ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAIForm(true)}
              className={`flex-1 font-medium ${showAIForm 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                : 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Tạo bằng AI
            </Button>
          </div>

          {/* AI Form */}
          {showAIForm && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-600">
              <div>
                <Label htmlFor="ai-prompt">Mô tả mục tiêu học tập của bạn</Label>
                <Input
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn cải thiện kỹ năng nghe tiếng Anh..."
                  className="mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <Button
                type="button"
                onClick={handleGenerateAI}
                disabled={!aiPrompt.trim() || isGeneratingAI}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium border-0"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tạo thói quen bằng AI
                  </>
                )}
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tên thói quen *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Học từ vựng mỗi ngày"
                required
                maxLength={50}
                className="mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/50 ký tự
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Học ít nhất 10 từ mới mỗi ngày"
                required
                maxLength={100}
                className="mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/100 ký tự
              </p>
            </div>

            {/* Icon Selection */}
            <div>
              <Label>Chọn biểu tượng</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {HABIT_ICONS.map((iconItem, index) => {
                  const Icon = iconItem.icon;
                  const isSelected = selectedIcon.name === iconItem.name;
                  const colorTheme = COLOR_THEMES[iconItem.color as keyof typeof COLOR_THEMES];
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIcon(iconItem)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? `${colorTheme.bgColor} border-current ${colorTheme.textColor} shadow-md`
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto ${
                        isSelected ? colorTheme.textColor : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <p className={`text-xs mt-1 ${
                        isSelected ? colorTheme.textColor : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {iconItem.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {title && description && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Xem trước:
                </Label>
                <div className="flex items-center mt-2">
                  <div className={`w-10 h-10 rounded-lg ${selectedIcon ? COLOR_THEMES[selectedIcon.color as keyof typeof COLOR_THEMES].bgColor : 'bg-gray-200'} flex items-center justify-center mr-3`}>
                    {selectedIcon && (
                      <selectedIcon.icon className={`h-5 w-5 ${COLOR_THEMES[selectedIcon.color as keyof typeof COLOR_THEMES].textColor}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !description.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo thói quen'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
