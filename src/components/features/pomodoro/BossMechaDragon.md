# Boss Mecha Dragon Component

Component Next.js (App Router) client hiển thị boss cyberpunk mecha-dragon với Canvas 2D/3D animation system.

## Tính năng chính

### 🎬 Animation System
- **Sprite-sheet**: Hỗ trợ 4×3 frames (12 frames tổng cộng)
- **FPS Control**: Điều chỉnh tốc độ animation (mặc định 9 FPS)
- **Idle Animation**: Nhịp "bob" nhẹ 1-2px để tạo cảm giác sống
- **Single-frame Fallback**: Không crash khi chỉ có 1 frame

### ⚡ Hiệu ứng trúng đòn
- **Flash Effect**: Trắng-xanh ngắn khi bị tấn công
- **Camera Shake**: Rung mạnh hơn khi critical hit
- **Floating Damage**: Số damage bay lên (vàng khi crit)
- **Particle Effects**: 
  - Tia điện cyan (2×2px) rơi nhanh
  - Giọt "dầu" đỏ sẫm

### 🎮 Gameplay Controls
- **Attack**: Tấn công thường (20-120 damage)
- **Crit**: Tấn công critical (100-300 damage)
- **Heal**: Hồi máu (+200 HP)
- **Reset**: Reset về trạng thái ban đầu
- **Auto Attack**: Tự động tấn công mỗi 2 giây
- **Max HP Presets**: 500/1000/2000/5000 HP

### 🎨 Phong cách Cyberpunk
- **Palette**: Cobalt/graphite kim loại + neon cyan/magenta
- **HP Bar**: Gradient theo mức máu (xanh → vàng → đỏ)
- **Grid Background**: Lưới nền cyberpunk
- **Neon Effects**: Viền sáng cyan cho boss

### 🔧 Kỹ thuật
- **TypeScript**: Type safety hoàn toàn
- **TailwindCSS**: Styling responsive
- **Canvas 2D**: 720×420px, responsive theo container
- **Three.js 3D**: Chế độ 3D với texture mapping
- **No External State**: Chỉ useState/useRef/useEffect

## Cách sử dụng

### Basic Usage
```tsx
import BossMechaDragon from './BossMechaDragon';

export default function MyPage() {
  return <BossMechaDragon />;
}
```

### Với Custom Props
```tsx
<BossMechaDragon className="my-custom-class" />
```

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `className` | `string` | `''` | CSS class tùy chỉnh |

## State Management

Component sử dụng local state với các hook:
- `useState` cho UI state
- `useRef` cho Canvas/Three.js refs
- `useEffect` cho animation loops
- `useCallback` cho event handlers

## Configuration

### Sprite Configuration
- **Sprite URL**: URL đến file PNG sprite-sheet
- **Columns**: Số cột (mặc định 4)
- **Rows**: Số hàng (mặc định 3)
- **FPS**: Tốc độ animation (mặc định 9)

### 3D Mode
- **Toggle**: Switch giữa 2D Canvas và 3D Three.js
- **Texture Mapping**: UV coordinates cho sprite-sheet
- **Lighting**: Ambient + directional lighting
- **Effects**: Neon outline, emissive glow

## Sanity Panel

Component có built-in validation panel:
- ✅ **Animation Mode**: cols > 1 || rows > 1
- ✅ **Sprite URL**: Không rỗng
- ✅ **Config Valid**: cols/rows/fps ≥ 1

## Error Handling

- **Invalid URL**: Không crash, hiển thị placeholder
- **Load Error**: Console warning, graceful fallback
- **Type Safety**: TypeScript strict mode
- **Runtime Checks**: Sanity panel validation

## Performance

- **Canvas 2D**: 60 FPS smooth animation
- **Three.js**: Optimized rendering với dispose cleanup
- **Memory**: Proper cleanup khi unmount
- **Responsive**: Canvas scale theo container

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Canvas 2D**: Full support
- **Three.js**: WebGL required
- **Mobile**: Touch-friendly controls

## Dependencies

```json
{
  "three": "^0.158.0",
  "@types/three": "^0.158.0"
}
```

## File Structure

```
src/components/features/pomodoro/
├── BossMechaDragon.tsx          # Main component
├── BossMechaDragonDemo.tsx      # Demo page
├── BossMechaDragon.md           # Documentation
└── index.ts                     # Exports
```

## Demo

Chạy demo component:
```tsx
import BossMechaDragonDemo from './BossMechaDragonDemo';

export default function DemoPage() {
  return <BossMechaDragonDemo />;
}
```

## Troubleshooting

### Sprite không hiển thị
- Kiểm tra URL có đúng không
- Đảm bảo file PNG có nền trong suốt
- Check CORS policy nếu load từ external URL

### Animation không chạy
- Kiểm tra cols/rows/fps settings
- Đảm bảo sprite-sheet có đủ frames
- Check Sanity Panel status

### 3D Mode không hoạt động
- Đảm bảo Three.js đã được cài đặt
- Check WebGL support trong browser
- Xem console errors

### Performance issues
- Giảm FPS nếu cần
- Tắt 3D mode nếu không cần
- Check memory usage trong DevTools
