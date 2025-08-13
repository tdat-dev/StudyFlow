import React, { useState } from "react";
import { ChatScreen } from "./features/chat/ChatScreen";
import { FlashcardScreen } from "./features/flashcards/FlashcardScreen";
import { HabitTracker } from "./features/habits/HabitTracker";
import { HomeDashboard } from "./features/home/HomeDashboard";
import { PomodoroTimer } from "./features/pomodoro/PomodoroTimer";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { User } from "../types/chat";
import { Header } from "./common/layout/Header";
import { BottomNav } from "./common/layout/BottomNav";

type TabType =
  | "home"
  | "chat"
  | "flashcards"
  | "habits"
  | "pomodoro"
  | "profile";

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [currentUser, setCurrentUser] = useState(user);

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeDashboard user={currentUser} onUpdateUser={handleUpdateUser} />
        );
      case "chat":
        return <ChatScreen user={currentUser} />;
      case "flashcards":
        return <FlashcardScreen user={currentUser} />;
      case "habits":
        return <HabitTracker user={currentUser} />;
      case "pomodoro":
        return <PomodoroTimer user={currentUser} />;
      case "profile":
        return <ProfileScreen user={currentUser} onLogout={onLogout} />;
      default:
        return (
          <HomeDashboard user={currentUser} onUpdateUser={handleUpdateUser} />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header user={currentUser} onLogout={onLogout} />
      {/* Content area với padding bottom để không bị che bởi bottom nav */}
      <div className="flex-1 overflow-hidden pb-16">{renderScreen()}</div>
      {/* Bottom nav luôn hiển thị ở dưới cho cả desktop và mobile */}
      <BottomNav
        activeTab={activeTab as any}
        onTabChange={(t) => setActiveTab(t as TabType)}
      />
    </div>
  );
}
