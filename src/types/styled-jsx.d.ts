// Bổ sung typing cho styled-jsx: cho phép dùng <style jsx> và <style global>
// Next.js sử dụng styled-jsx nên cần mở rộng React.StyleHTMLAttributes

import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
