import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PomodoroScreen from '../src/components/features/pomodoro/PomodoroScreen';
import { PomodoroProvider } from '../src/contexts/PomodoroContext';

// Mock Firebase
vi.mock('../src/services/firebase/auth', () => ({
  onAuthStateChanged: vi.fn((callback) => {
    callback({ uid: 'test-user' });
    return vi.fn();
  }),
}));

vi.mock('../src/services/firebase/firestore', () => ({
  getTasks: vi.fn().mockResolvedValue([]),
  addTask: vi.fn().mockResolvedValue({ id: 'task-1' }),
  updateTask: vi.fn().mockResolvedValue({}),
  deleteTask: vi.fn().mockResolvedValue({}),
}));

describe('Pomodoro - Thêm Task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Hiển thị form tạo task khi bấm nút "Thêm Task"', async () => {
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await userEvent.click(addButton);

    expect(screen.getByPlaceholderText(/nhập tên task/i)).toBeInTheDocument();
  });

  it('Thêm task mới với tên và ưu tiên', async () => {
    const user = userEvent.setup();
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    // Bấm nút thêm task
    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await user.click(addButton);

    // Nhập tên task
    const taskInput = screen.getByPlaceholderText(/nhập tên task/i);
    await user.type(taskInput, 'Học lập trình React');

    // Chọn ưu tiên
    const prioritySelect = screen.getByDisplayValue(/thường/i);
    await user.click(prioritySelect);
    const highPriority = screen.getByRole('option', { name: /cao/i });
    await user.click(highPriority);

    // Bấm nút lưu
    const submitButton = screen.getByRole('button', { name: /lưu|tạo/i });
    await user.click(submitButton);

    // Kiểm tra task được thêm vào danh sách
    await waitFor(() => {
      expect(screen.getByText('Học lập trình React')).toBeInTheDocument();
    });
  });

  it('Hủy form tạo task khi bấm nút Hủy', async () => {
    const user = userEvent.setup();
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    // Bấm nút thêm task
    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await user.click(addButton);

    // Nhập tên task
    const taskInput = screen.getByPlaceholderText(/nhập tên task/i);
    await user.type(taskInput, 'Task tạm');

    // Bấm nút hủy
    const cancelButton = screen.getByRole('button', { name: /hủy/i });
    await user.click(cancelButton);

    // Kiểm tra form bị đóng
    expect(screen.queryByPlaceholderText(/nhập tên task/i)).not.toBeInTheDocument();
  });

  it('Thay đổi số lượng Pomodoro cho task', async () => {
    const user = userEvent.setup();
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    // Bấm nút thêm task
    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await user.click(addButton);

    // Nhập tên task
    const taskInput = screen.getByPlaceholderText(/nhập tên task/i);
    await user.type(taskInput, 'Task Pomodoro');

    // Tìm input số Pomodoro
    const pomodoroInput = screen.getByDisplayValue(/2/);
    await user.clear(pomodoroInput);
    await user.type(pomodoroInput, '5');

    // Bấm lưu
    const submitButton = screen.getByRole('button', { name: /lưu|tạo/i });
    await user.click(submitButton);

    // Kiểm tra số pomodoro
    await waitFor(() => {
      expect(screen.getByText(/5 pomodoro/i)).toBeInTheDocument();
    });
  });

  it('Báo lỗi nếu thiếu trường bắt buộc', async () => {
    const user = userEvent.setup();
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    // Bấm nút thêm task
    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await user.click(addButton);

    // Bấm lưu mà không nhập tên
    const submitButton = screen.getByRole('button', { name: /lưu|tạo/i });
    await user.click(submitButton);

    // Kiểm tra thông báo lỗi
    expect(screen.getByText(/vui lòng nhập tên task/i)).toBeInTheDocument();
  });

  it('Thay đổi độ ưu tiên task', async () => {
    const user = userEvent.setup();
    render(
      <PomodoroProvider>
        <PomodoroScreen />
      </PomodoroProvider>
    );

    // Bấm nút thêm task
    const addButton = screen.getByRole('button', { name: /thêm task/i });
    await user.click(addButton);

    // Nhập tên task
    const taskInput = screen.getByPlaceholderText(/nhập tên task/i);
    await user.type(taskInput, 'Task ưu tiên');

    // Chọn ưu tiên cao
    const prioritySelect = screen.getByDisplayValue(/thường/i);
    await user.click(prioritySelect);
    const highPriority = screen.getByRole('option', { name: /cao/i });
    await user.click(highPriority);

    // Kiểm tra ưu tiên được chọn
    expect(screen.getByDisplayValue(/cao/i)).toBeInTheDocument();
  });
});
