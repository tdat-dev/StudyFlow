import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from '@/hooks/usePomodoro';

describe('Pomodoro - Thêm Task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Thêm task mới thành công', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Học lập trình React',
        priority: 'high',
        estimatedPomodoros: 3,
        description: 'Học về hooks và state management',
      });
    });

    expect(result.current.tasks.length).toBeGreaterThan(0);
    expect(result.current.tasks[0]?.title).toBe('Học lập trình React');
  });

  it('Báo lỗi khi thêm task không có tên', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      try {
        await result.current.addTask({
          title: '',
          priority: 'medium',
          estimatedPomodoros: 2,
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  it('Thêm task với số Pomodoro mặc định là 2', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Task mới',
        priority: 'medium',
      });
    });

    expect(result.current.tasks[0]?.estimatedPomodoros).toBe(2);
  });

  it('Thêm task với ưu tiên khác nhau', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Task cao',
        priority: 'high',
        estimatedPomodoros: 1,
      });

      await result.current.addTask({
        title: 'Task thường',
        priority: 'medium',
        estimatedPomodoros: 2,
      });

      await result.current.addTask({
        title: 'Task thấp',
        priority: 'low',
        estimatedPomodoros: 3,
      });
    });

    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.tasks[0]?.priority).toBe('high');
    expect(result.current.tasks[1]?.priority).toBe('medium');
    expect(result.current.tasks[2]?.priority).toBe('low');
  });

  it('Thay đổi độ ưu tiên task', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Task ưu tiên',
        priority: 'low',
        estimatedPomodoros: 2,
      });
    });

    const taskId = result.current.tasks[0]?.id;

    await act(async () => {
      await result.current.updateTask(taskId as string, {
        priority: 'high',
      });
    });

    expect(result.current.tasks[0]?.priority).toBe('high');
  });

  it('Thay đổi số lượng Pomodoro task', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Task Pomodoro',
        priority: 'medium',
        estimatedPomodoros: 2,
      });
    });

    const taskId = result.current.tasks[0]?.id;

    await act(async () => {
      await result.current.updateTask(taskId as string, {
        estimatedPomodoros: 5,
      });
    });

    expect(result.current.tasks[0]?.estimatedPomodoros).toBe(5);
  });

  it('Xóa task thành công', async () => {
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.addTask({
        title: 'Task xóa',
        priority: 'medium',
        estimatedPomodoros: 2,
      });
    });

    expect(result.current.tasks).toHaveLength(1);

    const taskId = result.current.tasks[0]?.id;

    await act(async () => {
      await result.current.deleteTask(taskId as string);
    });

    expect(result.current.tasks).toHaveLength(0);
  });
});
