# Kiến trúc hệ thống tích hợp Dashboard StudyFlow

```mermaid
graph TB
    subgraph "Frontend Components"
        HD[HomeDashboard]
        QA[QuickActions]
        WP[WeeklyProgress]
    end

    subgraph "Hooks Layer"
        DI[useDashboardIntegration]
        QA_H[useQuickActions]
        RT[useRealtimeUpdates]
    end

    subgraph "Services Layer"
        IS[integrationService]
        UPS[userProgressService]
        MS[missionsService]
    end

    subgraph "Firebase Collections"
        UP[user_progress]
        DM[daily_missions]
        FS[flashcard_stats]
        PS[pomodoro_stats]
        HC[habit_completions]
        HR[habit_resets]
        H[habits]
    end

    subgraph "Features"
        FC[FlashcardScreen]
        PT[PomodoroTimer]
        HT[HabitTracker]
    end

    %% Component connections
    HD --> DI
    QA --> DI
    WP --> DI

    %% Hook connections
    DI --> IS
    DI --> UPS
    DI --> MS
    QA_H --> DI
    RT --> DI

    %% Service connections
    IS --> UP
    IS --> FS
    IS --> PS
    IS --> HC
    IS --> HR
    UPS --> UP
    MS --> DM

    %% Feature integrations
    FC -.-> IS
    PT -.-> IS
    HT -.-> IS

    %% Data flow
    IS --> |"updateFlashcardProgress"| FS
    IS --> |"updatePomodoroProgress"| PS
    IS --> |"updateHabitProgress"| HC
    IS --> |"resetWeeklyHabits"| HR

    %% Styling
    classDef component fill:#e1f5fe
    classDef hook fill:#f3e5f5
    classDef service fill:#e8f5e8
    classDef firebase fill:#fff3e0
    classDef feature fill:#fce4ec

    class HD,QA,WP component
    class DI,QA_H,RT hook
    class IS,UPS,MS service
    class UP,DM,FS,PS,HC,HR,H firebase
    class FC,PT,HT feature
```

## Luồng dữ liệu

### 1. Flashcard Learning Flow

```
User học từ vựng → FlashcardScreen → integrationService.updateFlashcardProgress()
→ Firebase collections → Dashboard cập nhật realtime
```

### 2. Pomodoro Completion Flow

```
User hoàn thành Pomodoro → PomodoroTimer → integrationService.updatePomodoroProgress()
→ Firebase collections → Dashboard cập nhật realtime
```

### 3. Habit Tracking Flow

```
User đánh dấu thói quen → HabitTracker → integrationService.updateHabitProgress()
→ Firebase collections → Weekly reset logic → Dashboard cập nhật realtime
```

### 4. Quick Actions Flow

```
User click Quick Action → useQuickActions → integrationService methods
→ Firebase collections → Dashboard cập nhật ngay lập tức
```

## Tích hợp giữa các tính năng

- **Flashcard ↔ Pomodoro**: Thời gian học từ vựng được track trong pomodoro stats
- **Pomodoro ↔ Habits**: Pomodoro completion có thể trigger habit completion
- **Habits ↔ Flashcard**: Thói quen học tập ảnh hưởng đến flashcard progress
- **Weekly Reset**: Tất cả habits được reset mỗi tuần, ảnh hưởng đến weekly progress
