import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BossBattleCanvas from '../../components/features/pomodoro/BossBattleCanvas';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    setClearColor: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
    dispose: vi.fn(),
  })),
  PlaneGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  Mesh: vi.fn(),
  Texture: vi.fn(),
}));

// Mock canvas context
const mockCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  strokeRect: vi.fn(),
  font: '',
  textAlign: '',
  fillText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  globalAlpha: 1,
  beginPath: vi.fn(),
  arc: vi.fn(),
  translate: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext as any);

describe('BossBattleCanvas', () => {
  it('renders without crashing', () => {
    render(<BossBattleCanvas />);
    expect(screen.getByText('Attack')).toBeInTheDocument();
  });

  it('displays HP bar', () => {
    render(<BossBattleCanvas maxHp={1000} />);
    expect(screen.getByText('HP: 1000 / 1000')).toBeInTheDocument();
  });

  it('shows validation panel', () => {
    render(<BossBattleCanvas />);
    expect(screen.getByText('Runtime Tests')).toBeInTheDocument();
    expect(screen.getByText('Animation Mode:')).toBeInTheDocument();
    expect(screen.getByText('Sprite URL:')).toBeInTheDocument();
    expect(screen.getByText('Sprite Sheet:')).toBeInTheDocument();
  });

  it('handles attack button click', () => {
    render(<BossBattleCanvas maxHp={1000} />);
    const attackButton = screen.getByText('Attack');
    fireEvent.click(attackButton);

    // HP should decrease after attack
    expect(screen.getByText(/HP: \d+ \/ 1000/)).toBeInTheDocument();
  });

  it('handles crit attack button click', () => {
    render(<BossBattleCanvas maxHp={1000} />);
    const critButton = screen.getByText('Crit (100%)');
    fireEvent.click(critButton);

    // HP should decrease after crit attack
    expect(screen.getByText(/HP: \d+ \/ 1000/)).toBeInTheDocument();
  });

  it('handles heal button click', () => {
    render(<BossBattleCanvas maxHp={1000} />);
    const healButton = screen.getByText('Heal');
    fireEvent.click(healButton);

    // HP should increase after heal
    expect(screen.getByText(/HP: \d+ \/ 1000/)).toBeInTheDocument();
  });

  it('handles reset button click', () => {
    render(<BossBattleCanvas maxHp={1000} />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // HP should be reset to max
    expect(screen.getByText('HP: 1000 / 1000')).toBeInTheDocument();
  });

  it('toggles auto attack', () => {
    render(<BossBattleCanvas />);
    const autoAttackButton = screen.getByText('Auto Attack OFF');
    fireEvent.click(autoAttackButton);

    expect(screen.getByText('Auto Attack ON')).toBeInTheDocument();
  });

  it('disables buttons when HP is 0', () => {
    render(<BossBattleCanvas maxHp={0} />);
    const attackButton = screen.getByText('Attack');
    const critButton = screen.getByText('Crit (100%)');

    expect(attackButton).toBeDisabled();
    expect(critButton).toBeDisabled();
  });

  it('shows sprite configuration inputs', () => {
    render(<BossBattleCanvas />);
    expect(screen.getByLabelText('Sprite URL input')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Number of columns in sprite sheet'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Number of rows in sprite sheet'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Animation frames per second'),
    ).toBeInTheDocument();
  });
});
