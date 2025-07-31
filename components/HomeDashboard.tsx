import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Calendar, Trophy, Zap, BookOpen, Target, Loader2 } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth } from '../utils/firebase/config';

interface HomeDashboardProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export function HomeDashboard({ user, onUpdateUser }: HomeDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user.accessToken) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { profile: userProfile, error } = await firebase.firestore.getProfile(currentUser.uid);
      
      if (userProfile) {
        setProfile(userProfile);
        onUpdateUser({ ...user, ...userProfile });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const updateProgress = async (wordsLearned: number, studyTime: number = 5) => {
    if (!user.accessToken) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { profile: updatedProfile, error } = await firebase.firestore.updateProgress(
        currentUser.uid, 
        { wordsLearned, studyTime }
      );

      if (updatedProfile) {
        setProfile(updatedProfile);
        onUpdateUser({ ...user, ...updatedProfile });
      } else if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min(((profile.todayProgress || 0) / (profile.dailyGoal || 20)) * 100, 100);

  return (
    <div className="h-full overflow-y-auto p-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-blue-900">
              Chào {profile.name}! 👋
            </h1>
            <p className="text-gray-600">Hôm nay bạn muốn học gì?</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              {profile.streak || 0} ngày
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Today */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-blue-900">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Progress hôm nay
          </CardTitle>
          <CardDescription className="text-blue-700">
            Bạn đã học {profile.todayProgress || 0}/{profile.dailyGoal || 20} từ vựng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-3" />
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">
              {Math.round(progressPercentage)}% hoàn thành
            </span>
            <span className="text-blue-600">
              Còn {Math.max(0, (profile.dailyGoal || 20) - (profile.todayProgress || 0))} từ
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning CTA */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-900 mb-1">Tiếp tục học nào! 🚀</h3>
              <p className="text-yellow-700 text-sm">
                Hoàn thành mục tiêu hôm nay để duy trì streak
              </p>
            </div>
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
              onClick={() => updateProgress(5)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Học ngay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl text-blue-900 mb-1">{profile.streak || 0}</p>
            <p className="text-sm text-gray-600">Ngày liên tiếp</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl text-green-900 mb-1">{profile.totalWordsLearned || 0}</p>
            <p className="text-sm text-gray-600">Từ đã học</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Hoạt động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(3)}
            disabled={loading}
          >
            <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
            Ôn tập từ vựng đã học (+3 từ)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(5)}
            disabled={loading}
          >
            <Target className="h-4 w-4 mr-3 text-green-600" />
            Quiz kiểm tra nhanh (+5 từ)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(2)}
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-3 text-yellow-600" />
            Thử thách 5 phút (+2 từ)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}