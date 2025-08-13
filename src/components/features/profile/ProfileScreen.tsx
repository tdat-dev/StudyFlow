import React, { useState } from 'react';
import Button from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
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
  ArrowLeft,
  Sun,
  Moon,
  Smartphone,
  Volume2,
  VolumeX,
  Lock,
  FileQuestion,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const [activeSettingSection, setActiveSettingSection] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<any | null>(null);
  
  const handleSettingClick = (section: string) => {
    setActiveSettingSection(section);
  };
  const [achievements, setAchievements] = useState([
    { icon: Calendar, label: '7 ngày streak', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { icon: BookOpen, label: '245 từ đã học', color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: Target, label: '15 quiz hoàn thành', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { icon: Trophy, label: 'Người học tích cực', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  ]);

  const settingsItems = [
    { 
      icon: Bell, 
      label: 'Thông báo', 
      description: 'Nhắc nhở học tập hàng ngày',
      onClick: () => handleSettingClick('notifications')
    },
    { 
      icon: Palette, 
      label: 'Giao diện', 
      description: 'Chế độ sáng/tối',
      onClick: () => handleSettingClick('theme')
    },
    { 
      icon: Shield, 
      label: 'Quyền riêng tư', 
      description: 'Cài đặt bảo mật',
      onClick: () => handleSettingClick('privacy')
    },
    { 
      icon: HelpCircle, 
      label: 'Trợ giúp', 
      description: 'FAQ và hướng dẫn',
      onClick: () => handleSettingClick('help')
    },
  ];

  // Render thông báo cài đặt
  const renderNotificationsSettings = () => {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSettingSection(null)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <h1 className="text-blue-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Tùy chỉnh thông báo học tập</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Nhắc nhở học tập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-3 text-blue-600" />
                <span>Nhắc nhở hàng ngày</span>
              </div>
              <Badge>Bật</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-3 text-blue-600" />
                <span>Thông báo đẩy</span>
              </div>
              <Badge variant="outline">Tắt</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Volume2 className="h-5 w-5 mr-3 text-blue-600" />
                <span>Âm thanh thông báo</span>
              </div>
              <Badge>Bật</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
          Lưu thay đổi
        </Button>
      </div>
    );
  };
  
  // Render cài đặt giao diện
  const renderThemeSettings = () => {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSettingSection(null)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <h1 className="text-blue-900 mb-2">Giao diện</h1>
          <p className="text-gray-600">Tùy chỉnh giao diện ứng dụng</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Chế độ hiển thị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start p-4 h-auto">
              <Sun className="h-5 w-5 mr-3 text-yellow-600" />
              <div className="text-left">
                <p className="text-gray-900">Chế độ sáng</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start p-4 h-auto">
              <Moon className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="text-gray-900">Chế độ tối</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start p-4 h-auto bg-gray-50">
              <Smartphone className="h-5 w-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="text-gray-900">Theo hệ thống</p>
              </div>
            </Button>
          </CardContent>
        </Card>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
          Lưu thay đổi
        </Button>
      </div>
    );
  };
  
  // Render cài đặt quyền riêng tư
  const renderPrivacySettings = () => {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSettingSection(null)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <h1 className="text-blue-900 mb-2">Quyền riêng tư</h1>
          <p className="text-gray-600">Cài đặt bảo mật tài khoản</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Bảo mật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start p-4 h-auto">
              <Lock className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="text-gray-900">Đổi mật khẩu</p>
              </div>
            </Button>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-3 text-blue-600" />
                <span>Xác thực hai yếu tố</span>
              </div>
              <Badge variant="outline">Tắt</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Dữ liệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start p-4 h-auto">
              <FileQuestion className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="text-gray-900">Chính sách quyền riêng tư</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render trợ giúp
  const renderHelpSettings = () => {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSettingSection(null)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <h1 className="text-blue-900 mb-2">Trợ giúp</h1>
          <p className="text-gray-600">FAQ và hướng dẫn sử dụng</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Câu hỏi thường gặp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Làm thế nào để tạo flashcard?</p>
              <p className="text-sm text-gray-600">
                Vào tab Flashcards, nhấn nút "Tạo bộ mới" và điền thông tin cần thiết.
                Bạn có thể tạo thủ công hoặc sử dụng AI để tạo tự động.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Làm thế nào để sử dụng Pomodoro?</p>
              <p className="text-sm text-gray-600">
                Vào tab Pomodoro, thiết lập thời gian tập trung và nghỉ ngơi,
                sau đó nhấn nút Play để bắt đầu.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Làm thế nào để nâng cấp lên Premium?</p>
              <p className="text-sm text-gray-600">
                Vào trang Hồ sơ, nhấn vào nút "Nâng cấp Premium" và làm theo hướng dẫn.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
          Liên hệ hỗ trợ
        </Button>
      </div>
    );
  };

  // Render theo section đang active
  if (activeSettingSection === 'notifications') {
    return renderNotificationsSettings();
  }
  
  if (activeSettingSection === 'theme') {
    return renderThemeSettings();
  }
  
  if (activeSettingSection === 'privacy') {
    return renderPrivacySettings();
  }
  
  if (activeSettingSection === 'help') {
    return renderHelpSettings();
  }

  // Render màn hình chính
  return (
    <div className="h-full overflow-y-auto p-6 pb-20">
      {/* Profile Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-blue-900 mb-1">{user.name}</h2>
              <p className="text-blue-700 text-sm mb-2">{user.email}</p>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Level 3
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <div key={index} className="text-center relative">
                  <div className={`w-12 h-12 ${achievement.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`h-6 w-6 ${achievement.color}`} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 absolute -top-2 -right-2 bg-white rounded-full border border-red-200 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setAchievementToDelete(achievement);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
                  onClick={item.onClick}
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
      
      {/* Dialog xác nhận xóa thành tích */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành tích &quot;{achievementToDelete?.label}&quot;? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeleteAchievement()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
  // Hàm xóa thành tích
  const handleDeleteAchievement = () => {
    if (!achievementToDelete) return;
    
    // Tìm index của thành tích cần xóa
    const achievementIndex = achievements.findIndex(
      a => a.label === achievementToDelete.label
    );
    
    if (achievementIndex !== -1) {
      // Tạo một bản sao của mảng thành tích
      const updatedAchievements = [...achievements];
      
      // Xóa thành tích khỏi mảng
      updatedAchievements.splice(achievementIndex, 1);
      
      // Cập nhật mảng thành tích
      setAchievements(updatedAchievements);
      
      // Log chỉ trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.log('Đã xóa thành tích:', achievementToDelete.label);
      }
      
      // Đóng dialog
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
    }
  };
}