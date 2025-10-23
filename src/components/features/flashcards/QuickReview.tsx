import React, { useState, useCallback } from 'react';
import Button from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import {
  Shuffle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { SwipeableFlashcard } from './SwipeableFlashcard';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  example: string;
  exampleTranslation?: string;
  learned: boolean;
}

interface QuickReviewProps {
  learnedCards: Flashcard[];
  onComplete: (correctCount: number, totalCount: number) => void;
  onBack: () => void;
}

interface ReviewSession {
  cards: Flashcard[];
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  startTime: Date;
  completedCards: Set<string>;
}

export function QuickReview({
  learnedCards,
  onComplete,
  onBack,
}: QuickReviewProps) {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewMode, setReviewMode] = useState<'sequential' | 'random'>(
    'random',
  );
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    reviewedCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  });

  // Khởi tạo session ôn tập
  const startReview = useCallback(() => {
    if (learnedCards.length === 0) return;

    const shuffledCards =
      reviewMode === 'random'
        ? [...learnedCards].sort(() => Math.random() - 0.5)
        : learnedCards;

    const newSession: ReviewSession = {
      cards: shuffledCards,
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      startTime: new Date(),
      completedCards: new Set(),
    };

    setSession(newSession);
    setIsReviewing(true);
    setShowAnswer(false);
    setSessionStats({
      totalCards: shuffledCards.length,
      reviewedCards: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    });
  }, [learnedCards, reviewMode]);

  // Xử lý khi người dùng đánh giá câu trả lời
  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!session) return;

      const currentCard = session.cards[session.currentIndex];
      const newCompletedCards = new Set(session.completedCards);
      newCompletedCards.add(currentCard.id);

      const newSession = {
        ...session,
        correctCount: isCorrect
          ? session.correctCount + 1
          : session.correctCount,
        incorrectCount: isCorrect
          ? session.incorrectCount
          : session.incorrectCount + 1,
        completedCards: newCompletedCards,
      };

      setSession(newSession);
      setSessionStats(prev => ({
        ...prev,
        reviewedCards: prev.reviewedCards + 1,
        correctAnswers: isCorrect
          ? prev.correctAnswers + 1
          : prev.correctAnswers,
        incorrectAnswers: isCorrect
          ? prev.incorrectAnswers
          : prev.incorrectAnswers + 1,
      }));

      // Chuyển sang card tiếp theo
      setTimeout(() => {
        if (session.currentIndex < session.cards.length - 1) {
          setSession(prev =>
            prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null,
          );
          setShowAnswer(false);
        } else {
          // Hoàn thành session
          finishReview();
        }
      }, 1000);
    },
    [session],
  );

  // Hoàn thành session ôn tập
  const finishReview = useCallback(() => {
    if (!session) return;

    const totalCards = session.cards.length;
    const correctCount = session.correctCount;

    setIsReviewing(false);
    setSession(null);
    onComplete(correctCount, totalCards);
  }, [session, onComplete]);

  // Chuyển card trước/sau
  const navigateCard = useCallback(
    (direction: 'prev' | 'next') => {
      if (!session) return;

      const newIndex =
        direction === 'prev'
          ? Math.max(0, session.currentIndex - 1)
          : Math.min(session.cards.length - 1, session.currentIndex + 1);

      setSession(prev => (prev ? { ...prev, currentIndex: newIndex } : null));
      setShowAnswer(false);
    },
    [session],
  );

  // Toggle hiển thị đáp án
  const toggleAnswer = useCallback(() => {
    setShowAnswer(prev => !prev);
  }, []);

  // Tính toán thời gian đã ôn tập
  const getElapsedTime = useCallback(() => {
    if (!session) return '0:00';

    const elapsed = Date.now() - session.startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [session]);

  // Tính toán độ chính xác
  const getAccuracy = useCallback(() => {
    const total = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    return total > 0
      ? Math.round((sessionStats.correctAnswers / total) * 100)
      : 0;
  }, [sessionStats]);

  if (!isReviewing || !session) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {learnedCards.length} từ đã học
          </Badge>
        </div>

        {/* Review Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Ôn tập nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ôn tập lại các từ vựng bạn đã học để củng cố kiến thức
            </p>

            {/* Review Mode Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chế độ ôn tập:</label>
              <div className="flex gap-2">
                <Button
                  variant={reviewMode === 'random' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReviewMode('random')}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Ngẫu nhiên
                </Button>
                <Button
                  variant={reviewMode === 'sequential' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReviewMode('sequential')}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Tuần tự
                </Button>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={startReview}
              disabled={learnedCards.length === 0}
              className="w-full"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Bắt đầu ôn tập ({learnedCards.length} từ)
            </Button>

            {learnedCards.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Bạn chưa có từ nào đã học để ôn tập
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Stats */}
        {sessionStats.totalCards > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thống kê gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Độ chính xác</div>
                  <div className="font-semibold">{getAccuracy()}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Từ đã ôn</div>
                  <div className="font-semibold">
                    {sessionStats.reviewedCards}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const currentCard = session.cards[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.cards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header với thống kê */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsReviewing(false)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Thoát
        </Button>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getElapsedTime()}
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {sessionStats.correctAnswers}
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            {sessionStats.incorrectAnswers}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ ôn tập</span>
          <span>
            {session.currentIndex + 1} / {session.cards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <SwipeableFlashcard
            front={currentCard.front}
            back={currentCard.back}
            example={currentCard.example}
            exampleTranslation={currentCard.exampleTranslation}
            onSwipeLeft={() => handleAnswer(false)}
            onSwipeRight={() => handleAnswer(true)}
            disabled={false}
          />
        </div>
      </div>

      {/* Answer Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigateCard('prev')}
          disabled={session.currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Trước
        </Button>

        <Button variant="outline" onClick={toggleAnswer}>
          {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigateCard('next')}
          disabled={session.currentIndex === session.cards.length - 1}
        >
          Sau
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Answer Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="destructive"
          onClick={() => handleAnswer(false)}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Sai
        </Button>
        <Button
          variant="default"
          onClick={() => handleAnswer(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          Đúng
        </Button>
      </div>
    </div>
  );
}
