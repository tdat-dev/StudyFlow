# Changelog

## [UI/UX Enhancement - Landing Page & Auth] - 2024-12-19

### ✨ New Features
- **Landing Page**: Tạo trang chủ đẹp với hero section và features showcase
- **Animated Background**: Blob animations và gradient backgrounds
- **Enhanced Loading Screen**: Loading screen với animations và branding
- **Improved Auth Forms**: Auth forms với better visual hierarchy và animations

### 🎨 UI/UX Improvements
- **Landing Page** (`src/components/features/auth/LandingPage.tsx`):
  - Hero section với gradient text và call-to-action buttons
  - Features grid showcase với icons và descriptions
  - Stats section với impressive numbers
  - Animated background blobs
  - Responsive design cho mobile và desktop

- **Loading Screen** (`src/components/ui/LoadingScreen.tsx`):
  - Animated logo với float effect
  - Custom loading spinner
  - Animated background blobs
  - Branded messaging

- **Auth Forms** (LoginForm & RegisterForm):
  - Enhanced headers với animated logos
  - Better visual hierarchy
  - Improved spacing và typography
  - Backdrop blur effects

- **Animations** (tailwind.config.js):
  - Blob animations cho background
  - Float animations cho logos
  - Fade-in và slide-up transitions
  - Animation delays cho staggered effects

### 🔧 Technical Changes
- **New Components**:
  - `LandingPage`: Complete landing page với features
  - `LoadingScreen`: Enhanced loading experience
- **Animation System**: Custom keyframes và utility classes
- **Background System**: Animated gradient backgrounds
- **Responsive Design**: Mobile-first approach

### 📁 Files Modified
- `src/components/features/auth/LandingPage.tsx` - New landing page
- `src/components/ui/LoadingScreen.tsx` - New loading screen
- `src/pages/index.tsx` - Updated routing logic
- `src/components/features/auth/LoginForm.tsx` - Enhanced UI
- `src/components/features/auth/RegisterForm.tsx` - Enhanced UI
- `tailwind.config.js` - Added animations và utility classes
- `src/components/features/auth/index.ts` - Export new component

### 🎯 Benefits
- **Better First Impression**: Professional landing page
- **Reduced Bounce Rate**: Engaging visual design
- **Improved UX**: Smooth animations và transitions
- **Brand Consistency**: Unified design language
- **Mobile Friendly**: Responsive design

---

## [Design Tokens & Auth UI Refactor] - 2024-12-19

### ✨ New Features
- **Design Tokens**: Thêm utility classes trong `tailwind.config.js`
  - `.auth-card`: Dark glassmorphism card với `bg-neutral-900/95 border border-white/10 rounded-xl shadow-lg`
  - `.auth-input`: Dark input với `bg-neutral-950/60 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-indigo-500`
  - `.btn-primary`: Gradient button với `bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90`
  - `.btn-ghost`: Ghost button với `bg-white text-gray-900 hover:bg-gray-50`

- **New UI Components**:
  - `LoadingButton`: Button với loading state và `aria-busy` attribute
  - `PasswordField`: Input field với toggle hiện/ẩn mật khẩu

### 🎨 UI/UX Improvements
- **LoginForm** (`src/components/features/auth/LoginForm.tsx`):
  - Áp dụng design tokens mới
  - Thay thế inline Button/Input components bằng UI components
  - Sử dụng `PasswordField` cho mật khẩu
  - Sử dụng `LoadingButton` với loading state
  - Dark theme với glassmorphism effect
  - Cải thiện contrast và accessibility

- **RegisterForm** (`src/components/features/auth/RegisterForm.tsx`):
  - Áp dụng design tokens mới
  - Thay thế inline Button/Input components bằng UI components
  - Sử dụng `PasswordField` cho cả mật khẩu và xác nhận mật khẩu
  - Sử dụng `LoadingButton` với loading state
  - Dark theme với glassmorphism effect
  - Cải thiện contrast và accessibility

### 🔧 Technical Changes
- **tailwind.config.js**: Thêm custom utility classes plugin
- **Component Reusability**: Tách components inline thành reusable UI components
- **Accessibility**: Thêm `aria-busy` và proper labels cho password toggle
- **Code Organization**: Import UI components từ `src/components/ui/`

### 📁 Files Modified
- `tailwind.config.js` - Thêm design tokens
- `src/components/features/auth/LoginForm.tsx` - Refactor với design tokens
- `src/components/features/auth/RegisterForm.tsx` - Refactor với design tokens
- `src/components/ui/loading-button.tsx` - New component
- `src/components/ui/password-field.tsx` - New component

### 🎯 Benefits
- **Consistency**: Unified design system với reusable tokens
- **Maintainability**: Centralized styling trong tailwind config
- **Accessibility**: Better screen reader support
- **UX**: Improved loading states và password visibility toggle
- **Code Quality**: Reduced duplication, better component organization
