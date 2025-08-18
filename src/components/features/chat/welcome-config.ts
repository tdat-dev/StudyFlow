import {
  BookOpen,
  Calculator,
  Lightbulb,
  FileText,
  PenTool,
  Globe,
  Beaker,
  Brain,
} from 'lucide-react';

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
  // Toán học
  {
    id: 1,
    label: 'Giải toán từng bước',
    icon: Calculator,
    prompt:
      'Tôi cần giải bài toán này, bạn có thể hướng dẫn từng bước được không?',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'math' as const,
  },
  {
    id: 2,
    label: 'Tạo bài tập toán',
    icon: PenTool,
    prompt: 'Tạo cho tôi 5 bài tập toán về chủ đề: [Nhập chủ đề]',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'math' as const,
  },

  // Ngữ văn
  {
    id: 3,
    label: 'Học từ vựng',
    icon: BookOpen,
    prompt: 'Tạo flashcards từ vựng về chủ đề: [Nhập chủ đề]',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    category: 'language' as const,
  },
  {
    id: 4,
    label: 'Phân tích văn bản',
    icon: FileText,
    prompt: 'Hãy phân tích đoạn văn này giúp tôi: [Dán đoạn văn]',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    category: 'language' as const,
  },

  // Khoa học
  {
    id: 5,
    label: 'Giải thích khoa học',
    icon: Beaker,
    prompt:
      'Giải thích giúp tôi hiện tượng/khái niệm khoa học này: [Nhập khái niệm]',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    category: 'science' as const,
  },
  {
    id: 6,
    label: 'Thí nghiệm khoa học',
    icon: Lightbulb,
    prompt: 'Hướng dẫn tôi làm thí nghiệm về: [Nhập chủ đề]',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    category: 'science' as const,
  },

  // Tổng quát
  {
    id: 7,
    label: 'Phương pháp học',
    icon: Brain,
    prompt: 'Tư vấn phương pháp học hiệu quả cho môn: [Nhập tên môn]',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    category: 'general' as const,
  },
  {
    id: 8,
    label: 'Tạo đề thi thử',
    icon: Globe,
    prompt: 'Tạo đề thi thử cho tôi về môn: [Tên môn] với [số câu] câu hỏi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    category: 'general' as const,
  },
];
