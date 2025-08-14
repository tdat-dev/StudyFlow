import React, { useState, useEffect } from "react";
import Button from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Progress } from "../../ui/progress";
import { useTheme } from "next-themes";
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
  Flame,
  Clock,
  Award,
  MessageCircle,
  Crown,
  Zap,
} from "lucide-react";
import { useLevel } from "../../../contexts/LevelContext";
import {
  getLevelInfo,
  getXPProgress,
  LEVEL_THRESHOLDS,
  XP_ACTIONS,
} from "../../../services/level/levelSystem";

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export default function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const [activeSettingSection, setActiveSettingSection] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const { userStats, addUserXP } = useLevel();
  const { theme, setTheme } = useTheme();

  // Settings state
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    achievementAlerts: true,
    soundEffects: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: true,
    analyticsCollection: false,
    emailNotifications: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSettingClick = (section: string) => {
    setActiveSettingSection(section);
  };

  const handlePrivacyToggle = (setting: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
    console.log(`Privacy setting ${setting} toggled`);
  };

  // Icon resolver
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Crown,
      Trophy,
      Award,
      Star,
      Target,
      BookOpen,
      Zap,
      User,
    };
    return iconMap[iconName] || User;
  };

  // Get user initials for fallback avatar
  const getUserInitials = (user: any) => {
    if (!user) return "U";
    if (user.displayName || user.name) {
      const name = user.displayName || user.name;
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Get level info
  const levelInfo = getLevelInfo(userStats.level);
  const currentLevel = {
    ...levelInfo,
    icon: getIconComponent(levelInfo.icon),
  };
  const xpProgress = getXPProgress(userStats.totalXP);
  const userInitials = getUserInitials(user);

  // Real achievements based on user stats
  const achievements = [
    {
      icon: Flame,
      label: `${userStats.streakDays} ngày`,
      description: "Streak hiện tại",
      bgColor: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      icon: BookOpen,
      label: `${userStats.flashcardsStudied}`,
      description: "Flashcard đã học",
      bgColor: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      icon: Clock,
      label: `${Math.floor(userStats.studyTimeMinutes / 60)}h`,
      description: "Giờ học tập",
      bgColor: "bg-green-100",
      color: "text-green-600",
    },
    {
      icon: MessageCircle,
      label: `${userStats.chatMessages}`,
      description: "Tin nhắn AI",
      bgColor: "bg-purple-100",
      color: "text-purple-600",
    },
    {
      icon: Target,
      label: `${userStats.pomodoroSessions}`,
      description: "Pomodoro hoàn thành",
      bgColor: "bg-red-100",
      color: "text-red-600",
    },
    {
      icon: Award,
      label: `${userStats.totalXP}`,
      description: "Tổng XP",
      bgColor: "bg-yellow-100",
      color: "text-yellow-600",
    },
  ];

  const settingsItems = [
    {
      icon: Bell,
      label: "Thông báo",
      description: "Nhắc nhở học tập hàng ngày",
      onClick: () => handleSettingClick("notifications"),
    },
    {
      icon: Palette,
      label: "Giao diện",
      description: "Chế độ sáng/tối",
      onClick: () => handleSettingClick("theme"),
    },
    {
      icon: Shield,
      label: "Quyền riêng tư",
      description: "Cài đặt bảo mật",
      onClick: () => handleSettingClick("privacy"),
    },
    {
      icon: HelpCircle,
      label: "Trợ giúp",
      description: "FAQ và hướng dẫn",
      onClick: () => handleSettingClick("help"),
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
          <p className="text-gray-600">Tùy chỉnh cách bạn nhận thông báo</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Nhắc nhở học tập</CardTitle>
            <CardDescription>
              Nhận thông báo để duy trì thói quen học tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <span className="text-gray-900">Nhắc nhở hàng ngày</span>
              </div>
              <Switch
                checked={notifications.studyReminders}
                onCheckedChange={(checked: boolean) =>
                  setNotifications((prev) => ({
                    ...prev,
                    studyReminders: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Thành tích</CardTitle>
            <CardDescription>
              Nhận thông báo khi đạt được thành tích mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-900">Thông báo thành tích</span>
              </div>
              <Switch
                checked={notifications.achievementAlerts}
                onCheckedChange={(checked: boolean) =>
                  setNotifications((prev) => ({
                    ...prev,
                    achievementAlerts: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Âm thanh</CardTitle>
            <CardDescription>
              Bật/tắt hiệu ứng âm thanh trong ứng dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notifications.soundEffects ? (
                  <Volume2 className="h-5 w-5 text-green-600" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-gray-900">Hiệu ứng âm thanh</span>
              </div>
              <Switch
                checked={notifications.soundEffects}
                onCheckedChange={(checked: boolean) =>
                  setNotifications((prev) => ({
                    ...prev,
                    soundEffects: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render cài đặt giao diện
  const renderThemeSettings = () => {
    if (!mounted) {
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
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSettingSection(null)}
            className="pl-0 text-blue-600 dark:text-blue-400 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <h1 className="text-blue-900 dark:text-blue-100 mb-2">Giao diện</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tùy chỉnh giao diện ứng dụng
          </p>
        </div>

        <Card className="mb-6 bg-white dark:bg-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-900">
              Chế độ hiển thị
            </CardTitle>
            <CardDescription className="dark:text-gray-600">
              Chọn chế độ hiển thị phù hợp với bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="w-full justify-start p-4 h-auto"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-5 w-5 mr-3 text-yellow-600" />
              <div className="text-left">
                <p className="font-medium">Chế độ sáng</p>
                <p className="text-sm text-gray-500">
                  Giao diện sáng, dễ nhìn ban ngày
                </p>
              </div>
            </Button>

            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="w-full justify-start p-4 h-auto"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-medium dark:text-gray-100">Chế độ tối</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Giao diện tối, bảo vệ mắt ban đêm
                </p>
              </div>
            </Button>

            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="w-full justify-start p-4 h-auto dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => setTheme("system")}
            >
              <Smartphone className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
              <div className="text-left">
                <p className="font-medium dark:text-gray-100">Theo hệ thống</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Tự động theo cài đặt thiết bị
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Thông tin hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Chế độ đang sử dụng:{" "}
              <span className="font-medium capitalize dark:text-gray-100">
                {theme}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render hướng dẫn cấp độ
  const renderLevelGuide = () => {
    const {
      LEVEL_THRESHOLDS,
      XP_ACTIONS,
    } = require("../../../services/level/levelSystem");

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

          <h1 className="text-blue-900 mb-2">Hướng dẫn Cấp độ</h1>
          <p className="text-gray-600">
            Tìm hiểu cách lên cấp và kiếm kinh nghiệm
          </p>
        </div>

        {/* Cách kiếm XP */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Cách kiếm kinh nghiệm (XP)
            </CardTitle>
            <CardDescription>
              Hoạt động hàng ngày để tích lũy kinh nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium">Hoàn thành Flashcard</span>
              </div>
              <Badge variant="secondary">
                +{XP_ACTIONS.COMPLETE_FLASHCARD} XP
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3 text-blue-600" />
                <span className="font-medium">Chat với AI Tutor</span>
              </div>
              <Badge variant="secondary">+{XP_ACTIONS.CHAT_SESSION} XP</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-purple-600" />
                <span className="font-medium">Hoàn thành Pomodoro</span>
              </div>
              <Badge variant="secondary">
                +{XP_ACTIONS.COMPLETE_POMODORO} XP
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-3 text-orange-600" />
                <span className="font-medium">Hoàn thành Habit</span>
              </div>
              <Badge variant="secondary">+{XP_ACTIONS.COMPLETE_HABIT} XP</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Bảng cấp độ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Bảng cấp độ</CardTitle>
            <CardDescription>
              Kinh nghiệm cần thiết cho mỗi cấp độ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {LEVEL_THRESHOLDS.map((threshold: number, index: number) => {
                const level = index + 1;
                const isCurrentLevel = level === userStats.level;
                const isCompleted = userStats.totalXP >= threshold;

                return (
                  <div
                    key={level}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isCurrentLevel
                        ? "bg-blue-100 border border-blue-300"
                        : isCompleted
                        ? "bg-green-50"
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCurrentLevel
                            ? "bg-blue-600 text-white"
                            : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-gray-400 text-white"
                        }`}
                      >
                        {level}
                      </div>
                      <span
                        className={`ml-3 font-medium ${
                          isCurrentLevel ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        Cấp {level}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm ${
                          isCurrentLevel ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {threshold} XP
                      </span>
                      {isCurrentLevel && (
                        <div className="text-xs text-blue-600 font-medium">
                          Hiện tại
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
          <p className="text-gray-600">Cài đặt bảo mật và quyền riêng tư</p>
        </div>

        {/* Cài đặt quyền riêng tư */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Cài đặt quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát cách dữ liệu của bạn được sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Chia sẻ tiến độ học</div>
                <div className="text-xs text-gray-500">
                  Cho phép hiển thị thành tích của bạn trong bảng xếp hạng
                </div>
              </div>
              <Switch
                checked={privacySettings.shareProgress}
                onCheckedChange={() => handlePrivacyToggle("shareProgress")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  Thu thập dữ liệu phân tích
                </div>
                <div className="text-xs text-gray-500">
                  Giúp cải thiện ứng dụng thông qua dữ liệu sử dụng ẩn danh
                </div>
              </div>
              <Switch
                checked={privacySettings.analyticsCollection}
                onCheckedChange={() =>
                  handlePrivacyToggle("analyticsCollection")
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Email thông báo</div>
                <div className="text-xs text-gray-500">
                  Nhận email về tiến độ học tập và tính năng mới
                </div>
              </div>
              <Switch
                checked={privacySettings.emailNotifications}
                onCheckedChange={() =>
                  handlePrivacyToggle("emailNotifications")
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Bảo mật tài khoản */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Bảo mật tài khoản</CardTitle>
            <CardDescription>
              Quản lý bảo mật và xác thực tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start p-4 h-auto"
              onClick={() => alert("Tính năng đổi mật khẩu sẽ sớm có!")}
            >
              <Lock className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Đổi mật khẩu</p>
                <p className="text-sm text-gray-500">
                  Cập nhật mật khẩu tài khoản
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start p-4 h-auto"
              onClick={() => alert("Tính năng xác thực 2FA sẽ sớm có!")}
            >
              <Shield className="h-5 w-5 mr-3 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Xác thực hai yếu tố</p>
                <p className="text-sm text-gray-500">
                  Tăng cường bảo mật tài khoản
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Dữ liệu và chính sách */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              Dữ liệu và chính sách
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start p-4 h-auto"
              onClick={() =>
                alert("Chính sách quyền riêng tư sẽ được hiển thị!")
              }
            >
              <FileQuestion className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Chính sách quyền riêng tư</p>
                <p className="text-sm text-gray-500">
                  Tìm hiểu cách chúng tôi bảo vệ dữ liệu
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start p-4 h-auto border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (
                  confirm(
                    "Bạn có chắc muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác."
                  )
                ) {
                  alert("Tính năng xóa dữ liệu sẽ sớm có!");
                }
              }}
            >
              <div className="text-left">
                <p className="font-medium">Xóa tất cả dữ liệu</p>
                <p className="text-sm text-red-500">
                  Xóa vĩnh viễn tài khoản và dữ liệu học tập
                </p>
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
                Vào tab Flashcards, nhấn nút "Tạo bộ mới" và điền thông tin cần
                thiết. Bạn có thể tạo thủ công hoặc sử dụng AI để tạo tự động.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">
                Làm thế nào để sử dụng Pomodoro?
              </p>
              <p className="text-sm text-gray-600">
                Vào tab Pomodoro, thiết lập thời gian tập trung và nghỉ ngơi,
                sau đó nhấn nút Play để bắt đầu.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">
                Làm thế nào để nâng cấp lên Premium?
              </p>
              <p className="text-sm text-gray-600">
                Vào trang Hồ sơ, nhấn vào nút "Nâng cấp Premium" và làm theo
                hướng dẫn.
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
  if (activeSettingSection === "notifications") {
    return renderNotificationsSettings();
  }

  if (activeSettingSection === "theme") {
    return renderThemeSettings();
  }

  if (activeSettingSection === "privacy") {
    return renderPrivacySettings();
  }

  if (activeSettingSection === "help") {
    return renderHelpSettings();
  }

  if (activeSettingSection === "level-guide") {
    return renderLevelGuide();
  }

  // Render màn hình chính
  return (
    <div className="h-full overflow-y-auto p-6 pb-20 bg-white dark:bg-black">
      {/* Profile Header */}
      <Card className="mb-6 bg-white dark:bg-gray-100 border-blue-200 dark:border-gray-600">
        <CardContent className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          <div className="flex items-center">
            <div className="relative w-16 h-16 rounded-full mr-4 border-2 border-blue-200 dark:border-blue-600">
              {/* Always show fallback first */}
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userInitials}
              </div>

              {/* Overlay with actual photo if available */}
              {(user?.photoURL || user?.avatar || user?.picture) && (
                <img
                  src={user.photoURL || user.avatar || user.picture}
                  alt={user?.displayName || user?.name || user?.email || "User"}
                  className="absolute inset-0 w-full h-full rounded-full object-cover"
                  onLoad={(e) => {
                    console.log("Profile avatar loaded:", e.currentTarget.src);
                  }}
                  onError={(e) => {
                    console.log(
                      "Profile avatar failed to load:",
                      e.currentTarget.src
                    );
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-blue-900 dark:text-blue-100 mb-1">
                {user?.displayName ||
                  user?.name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                {user?.email || "No email"}
              </p>
              <div className="flex items-center space-x-2 mb-2">
                <Badge
                  variant="outline"
                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                >
                  {currentLevel.name}
                </Badge>
              </div>
              {/* Level Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center space-x-2">
                    <span>Level {userStats.level}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      onClick={() => setActiveSettingSection("level-guide")}
                    >
                      <HelpCircle className="h-3 w-3" />
                    </Button>
                  </div>
                  <span>
                    {xpProgress.current} / {xpProgress.required} XP
                  </span>
                </div>
                <Progress
                  value={xpProgress.percentage}
                  className="h-2 bg-blue-200 dark:bg-blue-900"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="mb-6 bg-white dark:bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-900">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Thành tích
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div
                    className={`w-12 h-12 ${achievement.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}
                  >
                    <Icon className={`h-6 w-6 ${achievement.color}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                    {achievement.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Stats */}
      <Card className="mb-6 bg-white dark:bg-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-900">
            Thống kê học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Streak hiện tại
            </span>
            <Badge
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              {userStats.streakDays} ngày
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Từ vựng đã học
            </span>
            <Badge
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              {userStats.flashcardsStudied} từ
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Thời gian học
            </span>
            <Badge
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              {Math.floor(userStats.studyTimeMinutes / 60)} giờ{" "}
              {userStats.studyTimeMinutes % 60} phút
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pomodoro hoàn thành</span>
            <Badge variant="outline">{userStats.pomodoroSessions} phiên</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tin nhắn AI</span>
            <Badge variant="outline">{userStats.chatMessages} tin nhắn</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng XP</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {userStats.totalXP} XP
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6 bg-white dark:bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-900">
            <Settings className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-600" />
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
                  className="w-full justify-start p-4 h-auto hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={item.onClick}
                >
                  <Icon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <div className="text-left">
                    <p className="text-gray-900 dark:text-gray-100">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </Button>
                {index < settingsItems.length - 1 && (
                  <Separator className="dark:border-gray-700" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="bg-white dark:bg-gray-100">
        <CardContent className="p-4">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-red-600 dark:text-red-600 border-red-200 dark:border-red-300 hover:bg-red-50 dark:hover:bg-red-100 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
