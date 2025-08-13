import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Slider } from "../../../components/ui/slider";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/input";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Coffee,
  BookOpen,
  CheckCircle2,
  Bell,
  Volume2,
  Settings,
  ArrowLeft,
  List,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  SkipForward,
  BarChart3,
} from "lucide-react";
import { auth, db } from "../../../services/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  user: any;
}

interface PomodoroSession {
  id: string;
  title: string;
  duration: number;
  completedAt?: string;
  type: "focus" | "break";
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export function PomodoroTimer({ user }: PomodoroTimerProps) {
  // Timer modes và cài đặt
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  // Trạng thái timer
  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null
  );

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Thống kê
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] =
    useState<PomodoroSession | null>(null);

  // Auto-update time khi thay đổi settings
  useEffect(() => {
    if (!isActive) {
      const timeMap = {
        pomodoro: pomodoroTime * 60,
        shortBreak: shortBreakTime * 60,
        longBreak: longBreakTime * 60,
      };
      setTimeLeft(timeMap[timerMode]);
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime, timerMode, isActive]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadSessionHistory();
    loadTasks();
  }, []);

  // Tải lịch sử phiên làm việc
  const loadSessionHistory = async () => {
    if (!auth.currentUser) {
      // Dữ liệu mẫu nếu không có người dùng
      const mockSessions = [
        {
          id: "1",
          title: "Học từ vựng",
          duration: 25,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: "focus",
        },
        {
          id: "2",
          title: "Nghỉ giải lao",
          duration: 5,
          completedAt: new Date(
            Date.now() - 23.5 * 60 * 60 * 1000
          ).toISOString(),
          type: "break",
        },
      ] as PomodoroSession[];

      setSessionHistory(mockSessions);
      setSessionsCompleted(
        mockSessions.filter((s) => s.type === "focus").length
      );
      setTotalFocusTime(
        mockSessions
          .filter((s) => s.type === "focus")
          .reduce((sum, s) => sum + s.duration, 0)
      );
      return;
    }

    try {
      const sessionsRef = collection(db, "pomodoro_sessions");
      const q = query(sessionsRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      const sessions: PomodoroSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          title: data.title,
          duration: data.duration,
          completedAt: data.completedAt?.toDate().toISOString(),
          type: data.type,
        });
      });

      // Sắp xếp theo thời gian hoàn thành (mới nhất lên đầu)
      sessions.sort((a, b) => {
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return (
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      });

      setSessionHistory(sessions);
      setSessionsCompleted(sessions.filter((s) => s.type === "focus").length);
      setTotalFocusTime(
        sessions
          .filter((s) => s.type === "focus")
          .reduce((sum, s) => sum + s.duration, 0)
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load pomodoro sessions:", error);
      }
    }
  };

  // Tải danh sách tasks
  const loadTasks = () => {
    // Mock data cho tasks
    const mockTasks: Task[] = [
      {
        id: "1",
        text: "Học từ vựng tiếng Anh",
        completed: false,
        estimatedPomodoros: 2,
        completedPomodoros: 0,
      },
      {
        id: "2",
        text: "Luyện nghe IELTS",
        completed: false,
        estimatedPomodoros: 3,
        completedPomodoros: 1,
      },
    ];
    setTasks(mockTasks);
  };

  // Đếm ngược thời gian
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Kết thúc phiên
      handleSessionComplete();
      playAlarm();
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Task management functions
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        text: newTaskText.trim(),
        completed: false,
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const selectTask = (taskId: string) => {
    setCurrentTaskId(taskId);
  };

  // Timer mode switching functions
  const switchToPomodoro = () => {
    if (!isActive) {
      setTimerMode("pomodoro");
      setTimeLeft(pomodoroTime * 60);
    }
  };

  const switchToShortBreak = () => {
    if (!isActive) {
      setTimerMode("shortBreak");
      setTimeLeft(shortBreakTime * 60);
    }
  };

  const switchToLongBreak = () => {
    if (!isActive) {
      setTimerMode("longBreak");
      setTimeLeft(longBreakTime * 60);
    }
  };

  // Get current timer duration in minutes
  const getCurrentDuration = () => {
    switch (timerMode) {
      case "pomodoro":
        return pomodoroTime;
      case "shortBreak":
        return shortBreakTime;
      case "longBreak":
        return longBreakTime;
      default:
        return pomodoroTime;
    }
  };

  // Lưu phiên làm việc vào Firestore
  const saveSession = async (session: Omit<PomodoroSession, "id">) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const sessionsRef = collection(db, "pomodoro_sessions");
      await addDoc(sessionsRef, {
        ...session,
        userId: auth.currentUser.uid,
        completedAt: Timestamp.now(),
      });

      // Tải lại lịch sử
      await loadSessionHistory();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save pomodoro session:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Bắt đầu phiên làm việc
  const startSession = () => {
    setIsActive(true);

    const duration = getCurrentDuration();
    const currentTask = tasks.find((t) => t.id === currentTaskId);
    const title = currentTask
      ? currentTask.text
      : timerMode === "pomodoro"
      ? "Tập trung học tập"
      : "Nghỉ ngơi";

    const newSession: PomodoroSession = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      duration,
      type: timerMode === "pomodoro" ? "focus" : "break",
    };

    setCurrentSession(newSession);
  };

  // Tạm dừng phiên làm việc
  const pauseSession = () => {
    setIsActive(false);
  };

  // Tiếp tục phiên làm việc
  const resumeSession = () => {
    setIsActive(true);
  };

  // Reset phiên làm việc
  const resetSession = () => {
    setIsActive(false);
    setTimeLeft(getCurrentDuration() * 60);
    setCurrentSession(null);
  };

  // Skip to next session
  const skipSession = () => {
    if (timerMode === "pomodoro") {
      setPomodoroCount((prev) => prev + 1);
      // Chuyển sang break (short hoặc long)
      if ((pomodoroCount + 1) % longBreakInterval === 0) {
        setTimerMode("longBreak");
        setTimeLeft(longBreakTime * 60);
      } else {
        setTimerMode("shortBreak");
        setTimeLeft(shortBreakTime * 60);
      }
    } else {
      // Từ break chuyển về pomodoro
      setTimerMode("pomodoro");
      setTimeLeft(pomodoroTime * 60);
    }

    setIsActive(false);
    setCurrentSession(null);
  };

  // Hoàn thành phiên làm việc
  const handleSessionComplete = async () => {
    setIsActive(false);

    if (currentSession) {
      // Lưu phiên làm việc vào lịch sử
      const completedSession = {
        ...currentSession,
        completedAt: new Date().toISOString(),
      };

      // Thêm vào lịch sử local
      setSessionHistory((prev) => [completedSession, ...prev]);

      // Cập nhật thống kê
      if (completedSession.type === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        setTotalFocusTime((prev) => prev + completedSession.duration);
        setPomodoroCount((prev) => prev + 1);

        // Cập nhật completed pomodoros cho task hiện tại
        if (currentTaskId) {
          setTasks(
            tasks.map((t) =>
              t.id === currentTaskId
                ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
                : t
            )
          );
        }
      }

      // Lưu vào Firestore
      await saveSession(completedSession);

      // Auto-switch sang session tiếp theo
      if (timerMode === "pomodoro") {
        // Chuyển sang break
        if (pomodoroCount % longBreakInterval === 0) {
          setTimerMode("longBreak");
          setTimeLeft(longBreakTime * 60);
        } else {
          setTimerMode("shortBreak");
          setTimeLeft(shortBreakTime * 60);
        }
      } else {
        // Từ break chuyển về pomodoro
        setTimerMode("pomodoro");
        setTimeLeft(pomodoroTime * 60);
      }

      setCurrentSession(null);
    }
  };

  // Phát âm thanh báo khi kết thúc phiên
  const playAlarm = () => {
    try {
      const audio = new Audio("/sounds/bell.mp3");
      audio.play();
    } catch (error) {
      // Xử lý lỗi khi không thể phát âm thanh
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to play alarm sound:", error);
      }
    }
  };

  // Format thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Tính toán phần trăm thời gian còn lại
  const calculateProgress = () => {
    const totalSeconds = getCurrentDuration() * 60;
    return (timeLeft / totalSeconds) * 100;
  };

  // Get timer colors based on mode
  const getTimerColors = () => {
    switch (timerMode) {
      case "pomodoro":
        return {
          bg: "bg-purple-500",
          bgLight: "bg-purple-50",
          text: "text-purple-600",
          textLight: "text-purple-500",
          border: "border-purple-200",
        };
      case "shortBreak":
        return {
          bg: "bg-green-500",
          bgLight: "bg-green-50",
          text: "text-green-600",
          textLight: "text-green-500",
          border: "border-green-200",
        };
      case "longBreak":
        return {
          bg: "bg-blue-500",
          bgLight: "bg-blue-50",
          text: "text-blue-600",
          textLight: "text-blue-500",
          border: "border-blue-200",
        };
      default:
        return {
          bg: "bg-purple-500",
          bgLight: "bg-purple-50",
          text: "text-purple-600",
          textLight: "text-purple-500",
          border: "border-purple-200",
        };
    }
  };
  const colors = getTimerColors();

  // Format thời gian thống kê
  const formatTotalTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} giờ ${mins > 0 ? `${mins} phút` : ""}`;
  };

  // Hiển thị cài đặt
  if (showSettings) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowSettings(false)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cài đặt Timer
          </h1>
          <p className="text-gray-600">Thay đổi sẽ được áp dụng ngay lập tức</p>
        </div>

        <div className="space-y-6">
          {/* Pomodoro Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Clock className="h-5 w-5 mr-2" />
                Pomodoro
              </CardTitle>
              <CardDescription>{pomodoroTime} phút</CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[pomodoroTime]}
                min={1}
                max={60}
                step={1}
                onValueChange={(value) => setPomodoroTime(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1 phút</span>
                <span>60 phút</span>
              </div>
            </CardContent>
          </Card>

          {/* Short Break Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Coffee className="h-5 w-5 mr-2" />
                Nghỉ Ngắn
              </CardTitle>
              <CardDescription>{shortBreakTime} phút</CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[shortBreakTime]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setShortBreakTime(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1 phút</span>
                <span>30 phút</span>
              </div>
            </CardContent>
          </Card>

          {/* Long Break Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <BookOpen className="h-5 w-5 mr-2" />
                Nghỉ Dài
              </CardTitle>
              <CardDescription>{longBreakTime} phút</CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[longBreakTime]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setLongBreakTime(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 phút</span>
                <span>60 phút</span>
              </div>
            </CardContent>
          </Card>

          {/* Long Break Interval */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <BarChart3 className="h-5 w-5 mr-2" />
                Chu Kỳ Nghỉ Dài
              </CardTitle>
              <CardDescription>
                Sau {longBreakInterval} pomodoro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[longBreakInterval]}
                min={2}
                max={8}
                step={1}
                onValueChange={(value) => setLongBreakInterval(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>2 pomodoro</span>
                <span>8 pomodoro</span>
              </div>
            </CardContent>
          </Card>

          {/* Auto Start Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Tự động bắt đầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Auto-start Pomodoros</span>
                <Badge variant="outline">Tắt</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span>Auto-start Breaks</span>
                <Badge variant="outline">Tắt</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Hiển thị lịch sử
  if (showHistory) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowHistory(false)}
            className="pl-0 text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <h1 className="text-blue-900 mb-2">Lịch sử Pomodoro</h1>
          <p className="text-gray-600">Các phiên làm việc đã hoàn thành</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phiên đã hoàn thành</span>
              <Badge variant="outline">{sessionsCompleted}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng thời gian tập trung</span>
              <Badge variant="outline">{formatTotalTime(totalFocusTime)}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sessionHistory.length > 0 ? (
            sessionHistory.map((session, index) => (
              <Card
                key={session.id || index}
                className={
                  session.type === "focus"
                    ? "border-blue-200"
                    : "border-green-200"
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {session.type === "focus" ? (
                        <Clock className="h-5 w-5 mr-3 text-blue-600" />
                      ) : (
                        <Coffee className="h-5 w-5 mr-3 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-gray-500">
                          {session.duration} phút •{" "}
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "numeric",
                                  month: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Đang tiến hành"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          session.type === "focus" ? "default" : "secondary"
                        }
                      >
                        {session.type === "focus" ? "Tập trung" : "Nghỉ ngơi"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có phiên làm việc nào</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hiển thị màn hình chính
  return (
    <div
      className={`h-full overflow-y-auto transition-colors duration-300 ${colors.bgLight}`}
    >
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        {/* Timer Mode Tabs */}
        <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 mb-8">
          <Button
            variant={timerMode === "pomodoro" ? "default" : "ghost"}
            size="sm"
            onClick={switchToPomodoro}
            disabled={isActive}
            className={`rounded-md ${
              timerMode === "pomodoro"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pomodoro
          </Button>
          <Button
            variant={timerMode === "shortBreak" ? "default" : "ghost"}
            size="sm"
            onClick={switchToShortBreak}
            disabled={isActive}
            className={`rounded-md ${
              timerMode === "shortBreak"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Nghỉ Ngắn
          </Button>
          <Button
            variant={timerMode === "longBreak" ? "default" : "ghost"}
            size="sm"
            onClick={switchToLongBreak}
            disabled={isActive}
            className={`rounded-md ${
              timerMode === "longBreak"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Nghỉ Dài
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-8xl font-bold text-white mb-8 text-center tracking-wider">
          {formatTime(timeLeft)}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-4 mb-8">
          {isActive ? (
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-md shadow-sm"
              onClick={pauseSession}
            >
              <Pause className="h-5 w-5 mr-2" />
              TẠM DỪNG
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-md shadow-sm"
              onClick={currentSession ? resumeSession : startSession}
            >
              <Play className="h-5 w-5 mr-2" />
              {currentSession ? "TIẾP TỤC" : "BẮT ĐẦU"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 rounded-md"
            onClick={resetSession}
            disabled={!currentSession && !isActive}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 rounded-md"
            onClick={skipSession}
            disabled={!isActive}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-6">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${100 - calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Session Info */}
        {currentTaskId && (
          <div className="text-white/90 text-lg mb-4">
            #{pomodoroCount + 1} -{" "}
            {tasks.find((t) => t.id === currentTaskId)?.text}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      {showTasks && (
        <div className="bg-white rounded-t-3xl p-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTasks(false)}
              className="text-gray-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Task */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Bạn đang làm gì?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} disabled={!newTaskText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentTaskId === task.id
                    ? `${colors.bgLight} ${colors.border} border-2`
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => selectTask(task.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={
                      task.completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }
                  >
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    {task.completedPomodoros}/{task.estimatedPomodoros}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Thêm task để bắt đầu làm việc!</p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className={`${colors.bgLight} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2`}
              >
                <CheckCircle2 className={`h-6 w-6 ${colors.text}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {sessionsCompleted}
              </p>
              <p className="text-sm text-gray-600">Phiên hoàn thành</p>
            </div>

            <div className="text-center">
              <div
                className={`${colors.bgLight} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2`}
              >
                <Clock className={`h-6 w-6 ${colors.text}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalFocusTime}
              </p>
              <p className="text-sm text-gray-600">Phút tập trung</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="rounded-xl flex flex-col h-auto py-4"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5 mb-2" />
              <span>Cài đặt</span>
            </Button>

            <Button
              variant="outline"
              className="rounded-xl flex flex-col h-auto py-4"
              onClick={() => setShowHistory(true)}
            >
              <List className="h-5 w-5 mb-2" />
              <span>Lịch sử</span>
            </Button>
          </div>
        </div>
      )}

      {!showTasks && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={() => setShowTasks(true)}
            className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-12 h-12 shadow-lg"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Dialog xác nhận xóa phiên làm việc */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiên làm việc &quot;
              {sessionToDelete?.title}&quot;? Hành động này không thể hoàn tác
              và phiên làm việc này sẽ bị xóa khỏi lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeleteSession()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Hàm xóa phiên làm việc
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      // Xóa khỏi state
      setSessionHistory(
        sessionHistory.filter((session) => session.id !== sessionToDelete.id)
      );

      // Cập nhật thống kê nếu là phiên tập trung
      if (sessionToDelete.type === "focus") {
        setSessionsCompleted((prev) => Math.max(0, prev - 1));
        setTotalFocusTime((prev) =>
          Math.max(0, prev - sessionToDelete.duration)
        );
      }

      // Xóa khỏi Firestore nếu có auth.currentUser
      if (auth.currentUser && sessionToDelete.id) {
        try {
          await deleteDoc(doc(db, "pomodoro_sessions", sessionToDelete.id));
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === "development") {
            console.log(`Deleted session ${sessionToDelete.id} from Firestore`);
          }
        } catch (error) {
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === "development") {
            console.error("Error deleting session from Firestore:", error);
          }
        }
      }

      // Đóng dialog
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (error) {
      // Chỉ log trong môi trường development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete session:", error);
      }
    }
  };
}
