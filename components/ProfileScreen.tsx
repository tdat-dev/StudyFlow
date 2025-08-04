import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Settings, 
  LogOut, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Target,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  Star,
  Award
} from 'lucide-react';
import { RankingSystem } from './RankingSystem';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  const achievements = [
    { icon: Calendar, label: `${user.streak || 0} ngày streak`, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { icon: BookOpen, label: `${user.totalWordsLearned || 0} từ đã học`, color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: Target, label: `${user.quizCompleted || 0} quiz hoàn thành`, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { icon: Trophy, label: 'Người học tích cực', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  ];

  const settingsItems = [
    { icon: Bell, label: 'Thông báo', description: 'Nhắc nhở học tập hàng ngày' },
    { icon: Palette, label: 'Giao diện', description: 'Chế độ sáng/tối' },
    { icon: Shield, label: 'Quyền riêng tư', description: 'Cài đặt bảo mật' },
    { icon: HelpCircle, label: 'Trợ giúp', description: 'FAQ và hướng dẫn' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20">
      {/* Profile Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mx-6 mt-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-blue-900 mb-1">{user.name}</h2>
              <p className="text-blue-700 text-sm mb-2">{user.email}</p>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Award className="h-3 w-3 mr-1" />
                  Học giả
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Cấp 3
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="profile" className="flex-1">Hồ sơ</TabsTrigger>
            <TabsTrigger value="rank" className="flex-1">Xếp hạng</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Cài đặt</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="profile" className="px-6 mt-0">

      {/* Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Thành tích
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 ${achievement.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`h-6 w-6 ${achievement.color}`} />
                  </div>
                  <p className="text-sm text-gray-600">{achievement.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-gray-900">Thống kê học tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Streak hiện tại</span>
            <Badge variant="outline">{user.streak} ngày</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Từ vựng đã học</span>
            <Badge variant="outline">245 từ</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Thời gian học</span>
            <Badge variant="outline">45 giờ</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quiz hoàn thành</span>
            <Badge variant="outline">15 bài</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Cài đặt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 h-auto hover:bg-gray-50"
                >
                  <Icon className="h-5 w-5 mr-3 text-gray-500" />
                  <div className="text-left">
                    <p className="text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </Button>
                {index < settingsItems.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

        </TabsContent>
        
        <TabsContent value="rank" className="mt-0">
          <RankingSystem user={user} />
        </TabsContent>
        
        <TabsContent value="settings" className="px-6 mt-0">
          {/* Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Cài đặt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto hover:bg-gray-50"
                    >
                      <Icon className="h-5 w-5 mr-3 text-gray-500" />
                      <div className="text-left">
                        <p className="text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </Button>
                    {index < settingsItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Logout */}
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Đăng xuất
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}