# Hệ thống tích hợp Dashboard StudyFlow

## Tổng quan

Hệ thống tích hợp mới của StudyFlow kết nối tất cả các tính năng chính (Flashcard, Pomodoro, Habits) vào một dashboard thống nhất với tracking progress realtime và hoạt động nhanh.

## Kiến trúc

### 1. Integration Service (`src/services/dashboard/integrationService.ts`)

Service chính quản lý việc tích hợp giữa các tính năng:

- **Flashcard Integration**: Tracking từ vựng đã học và cập nhật progress
- **Pomodoro Integration**: Tracking pomodoro hoàn thành và thời gian tập trung
- **Habits Integration**: Tracking thói quen hàng ngày với reset hàng tuần
- **Weekly Reset**: Tự động reset habits mỗi tuần

### 2. Dashboard Integration Hook (`src/hooks/useDashboardIntegration.ts`)

Hook React cung cấp:

- State management cho integrated progress
- Actions để cập nhật từng tính năng
- Realtime updates
- Quick actions

### 3. Components

#### QuickActions (`src/components/features/home/QuickActions.tsx`)

- Hoạt động nhanh cho flashcard, pomodoro, habits
- Progress summary với stats tổng hợp
- Navigation đến các tính năng chính

#### WeeklyProgress (`src/components/features/home/WeeklyProgress.tsx`)

- Tiến độ tuần với progress bars
- Level và streak tracking
- Mục tiêu hàng ngày

## Tính năng chính

### 1. Flashcard Integration

```typescript
// Khi học xong từ vựng
const result = await completeFlashcardSession(5, 15); // 5 từ, 15 phút
```

**Tính năng:**

- Tự động cập nhật progress từ vựng
- Hoàn thành mission review
- Tính XP dựa trên số từ học được
- Tracking thời gian học tập

### 2. Pomodoro Integration

```typescript
// Khi hoàn thành pomodoro
const result = await completePomodoroSession(1, 25); // 1 pomodoro, 25 phút
```

**Tính năng:**

- Tracking pomodoro hoàn thành
- Cập nhật thời gian tập trung
- Hoàn thành mission pomodoro
- Tính XP cho mỗi pomodoro

### 3. Habits Integration

```typescript
// Khi đánh dấu thói quen
const result = await toggleHabitCompletion(habitId, true);
```

**Tính năng:**

- Tracking thói quen hàng ngày
- Reset hàng tuần tự động
- Tính XP cho việc hoàn thành thói quen
- Weekly progress tracking

### 4. Weekly Reset Logic

- Tự động reset habits mỗi thứ 2
- Cập nhật weekly progress
- Tracking streak liên tục

## Database Schema

### Collections mới:

- `flashcard_stats`: Stats flashcard theo ngày
- `pomodoro_stats`: Stats pomodoro theo ngày
- `habit_completions`: Completion tracking cho habits
- `habit_resets`: Lịch sử reset hàng tuần

### Collections hiện có:

- `user_progress`: Progress tổng thể
- `daily_missions`: Nhiệm vụ hàng ngày
- `habits`: Thói quen của user

## Quick Actions

### 1. Ôn tập nhanh

- Học 5 từ vựng trong 10 phút
- +25 XP
- Hoàn thành mission review

### 2. Tập trung 25 phút

- Hoàn thành 1 Pomodoro
- +40 XP
- Hoàn thành mission pomodoro

### 3. Đánh dấu thói quen

- Hoàn thành thói quen hôm nay
- +15 XP
- Hoàn thành mission habit

### 4. Học tập chuyên sâu

- 2 Pomodoro + 10 từ vựng
- +80 XP
- Kết hợp nhiều tính năng

## Realtime Updates

- Auto refresh mỗi 5 phút
- Refresh khi tab trở nên visible
- Cập nhật progress ngay lập tức sau actions
- Sync với Firebase realtime

## Cách sử dụng

### 1. Trong Component

```typescript
import { useDashboardIntegration } from '../../../hooks/useDashboardIntegration';

function MyComponent({ user }) {
  const {
    progress,
    completeFlashcardSession,
    completePomodoroSession,
    toggleHabitCompletion,
    refreshProgress,
  } = useDashboardIntegration(user);

  // Sử dụng progress data
  const wordsLearned = progress?.wordsLearnedToday || 0;

  // Thực hiện actions
  const handleLearnWords = async () => {
    const result = await completeFlashcardSession(5, 15);
    if (result.success) {
      console.log(result.message); // "Đã học 5 từ vựng mới! +25 XP"
    }
  };
}
```

### 2. Quick Actions

```typescript
import { useQuickActions } from '../../../hooks/useDashboardIntegration';

function QuickActionsComponent({ user }) {
  const {
    handleQuickFlashcardReview,
    handleQuickPomodoro,
    handleQuickHabitCheck,
  } = useQuickActions(user);

  // Sử dụng quick actions
  const handleReview = () => handleQuickFlashcardReview(5);
  const handlePomodoro = () => handleQuickPomodoro(1);
}
```

## Lợi ích

1. **Tích hợp hoàn chỉnh**: Tất cả tính năng được kết nối
2. **Realtime tracking**: Progress cập nhật ngay lập tức
3. **Gamification**: XP và achievements tích hợp
4. **User Experience**: Hoạt động nhanh và dễ sử dụng
5. **Data consistency**: Dữ liệu đồng bộ giữa các tính năng
6. **Scalability**: Dễ dàng thêm tính năng mới

## Tương lai

- Thêm AI recommendations
- Social features (leaderboard, challenges)
- Advanced analytics
- Mobile app integration
- Offline support
