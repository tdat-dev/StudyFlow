import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { BookOpen, Headphones, Target, Calendar, TrendingUp, BookMarked, Pencil, Loader2 } from 'lucide-react';
import { db, auth } from '../utils/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

interface AddHabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

const HABIT_ICONS = [
  { name: 'BookOpen', icon: BookOpen, color: 'blue' },
  { name: 'Headphones', icon: Headphones, color: 'green' },
  { name: 'Target', icon: Target, color: 'red' },
  { name: 'Calendar', icon: Calendar, color: 'purple' },
  { name: 'TrendingUp', icon: TrendingUp, color: 'orange' },
  { name: 'BookMarked', icon: BookMarked, color: 'cyan' },
  { name: 'Pencil', icon: Pencil, color: 'pink' }
];

export function AddHabitForm({ isOpen, onClose, onHabitAdded }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !selectedIcon || !auth.currentUser) {
      return;
    }

    setLoading(true);
    try {
      // Lấy thông tin icon và màu sắc
      const iconInfo = HABIT_ICONS.find(icon => icon.name === selectedIcon);
      const colorMap: Record<string, { bg: string, light: string, text: string }> = {
        'blue': { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600' },
        'green': { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600' },
        'red': { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-600' },
        'purple': { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600' },
        'orange': { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600' },
        'cyan': { bg: 'bg-cyan-500', light: 'bg-cyan-100', text: 'text-cyan-600' },
        'pink': { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-600' }
      };
      
      const colorInfo = colorMap[iconInfo?.color || 'blue'];

      // Tạo mảng tiến trình tuần và tháng
      const today = new Date();
      const weeklyProgress = Array(7).fill(false);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthlyProgress = Array(daysInMonth).fill(false);

      // Thêm thói quen mới vào Firestore
      await addDoc(collection(db, "habits"), {
        userId: auth.currentUser.uid,
        title,
        description,
        iconName: selectedIcon,
        color: colorInfo.bg,
        bgColor: colorInfo.light,
        textColor: colorInfo.text,
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress,
        monthlyProgress,
        createdAt: new Date().toISOString()
      });

      // Reset form và đóng dialog
      setTitle('');
      setDescription('');
      setSelectedIcon('BookOpen');
      onHabitAdded();
      onClose();
    } catch (error) {
      console.error('Error adding habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-blue-900">
            Thêm thói quen mới
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Tên thói quen
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Học từ vựng mỗi ngày"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Học ít nhất 10 từ mới mỗi ngày"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="icon" className="text-sm font-medium text-gray-700">
              Biểu tượng
            </label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn biểu tượng" />
              </SelectTrigger>
              <SelectContent>
                {HABIT_ICONS.map((icon) => {
                  const Icon = icon.icon;
                  const colorClass = `text-${icon.color}-500`;
                  
                  return (
                    <SelectItem key={icon.name} value={icon.name}>
                      <div className="flex items-center">
                        <Icon className={`h-4 w-4 mr-2 ${colorClass}`} />
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thói quen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}