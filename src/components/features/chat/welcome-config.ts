import { BookOpen, Calculator, Lightbulb, FileText } from 'lucide-react';

export const studyFlowWelcomeMessage = `👋 Xin chào! Tôi là StudyFlow AI - trợ lý học tập thông minh và đa năng!

🎯 Tôi có thể giúp bạn với TẤT CẢ các môn học:

📚 TIẾNG ANH: Từ vựng, ngữ pháp, giao tiếp, IELTS/TOEIC
🔢 TOÁN HỌC: Đại số, hình học, giải tích, thống kê
⚗️ KHOA HỌC: Vật lý, Hóa học, Sinh học
🌍 NHÂN VĂN: Lịch sử, Địa lý, Văn học
💻 TIN HỌC: Lập trình, thuật toán, công nghệ
📖 CÁC MÔN KHÁC: Triết học, Kinh tế, Tâm lý...

⭐ Chức năng của tôi:
• Tạo flashcards cho mọi môn học
• Giải bài tập từng bước chi tiết
• Giải thích khái niệm phức tạp đơn giản
• Tạo đề thi thử và bài tập thực hành
• Tư vấn phương pháp học hiệu quả
• Hỗ trợ luyện thi các kỳ thi quan trọng

💬 Bạn có thể hỏi tôi về bất kỳ môn học nào, từ tiểu học đến đại học!

🚀 Hãy bắt đầu bằng việc cho tôi biết bạn đang học môn gì hoặc chọn gợi ý bên dưới!`;

export const studyFlowQuickActions = [
  {
    id: 1,
    label: '📚 Tạo flashcards học tập',
    icon: BookOpen,
    prompt:
      'Tạo flashcards cho tôi về chủ đề: [Điền tên môn học và chủ đề cụ thể]',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 2,
    label: '🔢 Giải toán',
    icon: Calculator,
    prompt:
      'Tôi cần giải bài toán này, bạn có thể hướng dẫn từng bước được không?',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 3,
    label: '💡 Giải thích khái niệm',
    icon: Lightbulb,
    prompt:
      'Bạn có thể giải thích giúp tôi khái niệm này một cách đơn giản dễ hiểu được không?',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 4,
    label: '📝 Tạo đề thi thử',
    icon: FileText,
    prompt:
      'Tạo đề thi thử cho tôi về môn: [Điền tên môn học] với [số câu] câu hỏi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];
