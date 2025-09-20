# Accessibility Improvements for StudyFlow

## Tổng quan

StudyFlow đã được cải thiện để đáp ứng các tiêu chuẩn accessibility và tạo trải nghiệm tốt hơn cho người dùng có nhu cầu đặc biệt.

## Các cải thiện chính

### 1. Độ tương phản cao (High Contrast)

- **Màu chữ**: Đã thay đổi từ `#FFFFFF` (trắng thuần) thành `#E0E0E0` (trắng xám nhạt) để giảm chói mắt
- **Màu phụ**: Cải thiện từ `#8b949e` thành `#B4B4B4` để tăng độ tương phản
- **Màu accent**: Giảm saturation từ `#2D5B9E` thành `#4A90E2` để thoải mái hơn cho mắt

### 2. Elevation và Chiều sâu

- **Header**: Thêm gradient và shadow để tạo cảm giác nổi
- **Cards**: Sử dụng `card-elevated` class với shadow và border tinh tế
- **Sidebar**: Thêm `surface-elevated` class để tạo layer

### 3. Accessibility Features

#### High Contrast Toggle

- Nút toggle trong header để bật/tắt chế độ tương phản cao
- Tự động phát hiện `prefers-contrast: high` của hệ thống
- Lưu preference vào localStorage

#### Focus Management

- Outline rõ ràng cho tất cả interactive elements
- Focus ring màu xanh `#4A90E2` với offset 2px
- Hỗ trợ keyboard navigation

#### Reduced Motion Support

- Tự động tắt transitions khi user có `prefers-reduced-motion: reduce`
- Giảm animation cho người dùng nhạy cảm với chuyển động

### 4. Form Elements

- Input, textarea, select có border và background rõ ràng
- Focus state với border màu xanh và box-shadow
- Placeholder text có độ tương phản phù hợp

## CSS Classes mới

### Elevation Classes

```css
.dark .header-elevated     /* Header với gradient và shadow */
.dark .card-elevated       /* Cards với shadow và border */
.dark .surface-elevated    /* Sidebar và surfaces */
```

### High Contrast Classes

```css
.high-contrast.dark        /* Manual high contrast mode */
```

### Accessibility Classes

```css
.dark .icon-enhanced       /* Icons với drop-shadow */
.dark .progress-ring       /* Progress rings với glow effect */
```

## Sử dụng

### 1. Toggle High Contrast

```tsx
import { AccessibilityToggle } from './components/ui/accessibility-toggle';

<AccessibilityToggle className="hidden sm:flex" />;
```

### 2. Áp dụng Elevation

```tsx
// Header
<header className="dark:header-elevated">

// Cards
<div className="dark:card-elevated">

// Surfaces
<div className="dark:surface-elevated">
```

### 3. Sử dụng màu sắc mới

```tsx
// Text colors
<span className="text-studyflow-text">        // #E0E0E0
<span className="text-studyflow-text-muted">  // #B4B4B4
<span className="text-studyflow-text-subtle"> // #9A9A9A

// Accent color
<button className="bg-studyflow-accent">      // #4A90E2
```

## Testing

### 1. Contrast Ratio

- Sử dụng tools như WebAIM Contrast Checker
- Đảm bảo tỷ lệ tương phản ≥ 4.5:1 cho text thường
- Đảm bảo tỷ lệ tương phản ≥ 7:1 cho text quan trọng

### 2. Keyboard Navigation

- Test tab order
- Test focus indicators
- Test keyboard shortcuts

### 3. Screen Reader

- Test với NVDA, JAWS, hoặc VoiceOver
- Đảm bảo semantic HTML
- Test ARIA labels

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Future Improvements

1. **Font Size Toggle**: Thêm nút để tăng/giảm font size
2. **Color Blind Support**: Thêm color schemes cho colorblind users
3. **Voice Commands**: Hỗ trợ điều khiển bằng giọng nói
4. **Screen Reader Optimization**: Cải thiện semantic HTML và ARIA

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
