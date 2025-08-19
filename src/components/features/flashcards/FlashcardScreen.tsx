import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Plus,
  BrainCircuit,
  Trash2,
  AlertTriangle,
  Minus,
  Edit,
  Save,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SwipeableFlashcard } from './SwipeableFlashcard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { auth, db } from '../../../services/firebase/config';
import { generateGeminiResponse } from '../../../services/gemini/config';
import { useLevel } from '../../../contexts/LevelContext';

interface FlashcardsScreenProps {
  user: any;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  color: string;
  cards: any[];
  total: number;
  learned: number;
}

export function FlashcardScreen({ user }: FlashcardsScreenProps) {
  const [currentView, setCurrentView] = useState<'list' | 'player'>('list');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingExample, setGeneratingExample] = useState(false);
  const { addUserXP, updateStats, userStats } = useLevel();

  // State cho AI Flashcard Creator
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckTopic, setNewDeckTopic] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // State cho xóa deck
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);

  // Định nghĩa hàm loadFlashcards
  const loadFlashcards = useCallback(async () => {
    if (!user.accessToken || !auth.currentUser) {
      // Nếu không có người dùng, không hiển thị dữ liệu gì
      setDecks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Tải dữ liệu từ Firestore
      const flashcardsRef = collection(db, 'flashcard_decks');
      const q = query(
        flashcardsRef,
        where('userId', '==', auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);

      const serverDecks: any[] = [];
      querySnapshot.forEach(doc => {
        serverDecks.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Thêm màu sắc cho các deck
      const decksWithColors = serverDecks.map((deck, index) => ({
        ...deck,
        color:
          index % 3 === 0
            ? 'bg-[var(--primary)]'
            : index % 3 === 1
              ? 'bg-[var(--success)]'
              : 'bg-[var(--warning)]',
      }));

      setDecks(decksWithColors);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load flashcards:', error);
      }
      // Nếu có lỗi, chỉ để empty state
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const startDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentView('player');
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentCardIndex < (selectedDeck?.cards?.length || 0) - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const markCardAsLearned = async (learned: boolean) => {
    if (!selectedDeck || !selectedDeck.cards) return;

    const card = selectedDeck.cards[currentCardIndex];
    if (!card) return;

    // Update card in state
    const updatedDecks = decks.map(deck => {
      if (deck.id === selectedDeck.id) {
        const updatedCards = deck.cards.map((c, idx) => {
          if (idx === currentCardIndex) {
            return { ...c, learned };
          }
          return c;
        });

        return {
          ...deck,
          cards: updatedCards,
          learned: learned
            ? deck.learned + (card.learned ? 0 : 1)
            : deck.learned - (card.learned ? 1 : 0),
        };
      }
      return deck;
    });

    setDecks(updatedDecks);

    // Update selected deck
    const updatedDeck = updatedDecks.find(d => d.id === selectedDeck.id);
    if (updatedDeck) {
      setSelectedDeck(updatedDeck);
    }

    // Award XP for studying flashcard
    if (learned && !card.learned) {
      await addUserXP('COMPLETE_FLASHCARD');
      await updateStats({ flashcardsStudied: userStats.flashcardsStudied + 1 });
    }

    // Move to next card
    nextCard();

    // Update in Firestore (if not using mock data)
    if (
      auth.currentUser &&
      selectedDeck.id &&
      !selectedDeck.id.startsWith('local-')
    ) {
      try {
        const deckRef = doc(db, 'flashcard_decks', selectedDeck.id);
        await updateDoc(deckRef, {
          [`cards.${currentCardIndex}.learned`]: learned,
          learned: learned
            ? selectedDeck.learned + (card.learned ? 0 : 1)
            : selectedDeck.learned - (card.learned ? 1 : 0),
        });
      } catch (error) {
        console.error('Failed to update card status:', error);
      }
    }
  };

  const generateNewExample = async () => {
    if (!selectedDeck || !selectedDeck.cards) return;

    const card = selectedDeck.cards[currentCardIndex];
    if (!card) return;

    setGeneratingExample(true);

    try {
      // Sử dụng Gemini API để tạo ví dụ mới
      const prompt = `Hãy tạo một câu ví dụ ngắn gọn, dễ hiểu bằng tiếng Anh sử dụng từ hoặc cụm từ "${card.front}" (nghĩa: "${card.back}"). Câu ví dụ nên ngắn gọn, rõ ràng và phù hợp với ngữ cảnh thông thường. Không sử dụng markdown. Chỉ trả về một câu ví dụ.`;

      let newExample;
      try {
        // Gọi API AI
        newExample = await generateGeminiResponse(prompt);

        // Loại bỏ các ký hiệu markdown và làm sạch câu ví dụ
        newExample = newExample
          .replace(/\*\*/g, '') // Loại bỏ dấu **
          .replace(/\*/g, '') // Loại bỏ dấu *
          .replace(/`/g, '') // Loại bỏ dấu `
          .replace(/^["'](.*)["']$/, '$1') // Loại bỏ dấu ngoặc kép/đơn bao quanh
          .trim();

        if (!newExample || newExample.length < 10) {
          throw new Error('Invalid response from AI');
        }
      } catch (aiError) {
        console.error('Error calling AI:', aiError);
        // Fallback nếu API lỗi
        const newExamples = [
          `I use the word "${card.front}" in my daily conversation.`,
          `Let me give you an example with "${card.front}" in context.`,
          `"${card.front}" is commonly used when talking about this topic.`,
        ];
        newExample =
          newExamples[Math.floor(Math.random() * newExamples.length)];
      }

      // Update the card with a new example
      const updatedDecks = decks.map(deck => {
        if (deck.id === selectedDeck.id) {
          const updatedCards = deck.cards.map((c, idx) => {
            if (idx === currentCardIndex) {
              return {
                ...c,
                example: newExample,
              };
            }
            return c;
          });

          return { ...deck, cards: updatedCards };
        }
        return deck;
      });

      setDecks(updatedDecks);

      // Update selected deck
      const updatedDeck = updatedDecks.find(d => d.id === selectedDeck.id);
      if (updatedDeck) {
        setSelectedDeck(updatedDeck);
      }
    } catch (error) {
      console.error('Failed to generate new example:', error);
    } finally {
      setGeneratingExample(false);
    }
  };

  // Hàm xóa deck
  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;

    try {
      // Xóa khỏi state
      setDecks(decks.filter(deck => deck.id !== deckToDelete.id));

      // Xóa khỏi Firestore nếu có auth.currentUser và không phải deck local
      if (
        auth.currentUser &&
        deckToDelete.id &&
        !deckToDelete.id.startsWith('local-')
      ) {
        try {
          await deleteDoc(doc(db, 'flashcard_decks', deckToDelete.id));
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Deleted deck ${deckToDelete.id} from Firestore`);
          }
        } catch (error) {
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === 'development') {
            console.error('Error deleting deck from Firestore:', error);
          }
        }
      }

      // Đóng dialog
      setDeleteDialogOpen(false);
      setDeckToDelete(null);
    } catch (error) {
      // Chỉ log trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete deck:', error);
      }
    }
  };

  // Hàm tạo flashcards mới bằng AI
  const createAIFlashcards = async () => {
    if (
      !newDeckTitle.trim() ||
      !newDeckTopic.trim() ||
      !newDeckSubject.trim()
    ) {
      return;
    }

    setCreatingDeck(true);

    try {
      // Tự động xác định ngôn ngữ dựa vào môn học
      let frontLanguage = 'tiếng Anh';
      let backLanguage = 'tiếng Việt';

      // Tự động xác định ngôn ngữ dựa vào môn học
      if (newDeckSubject === 'Tiếng Anh') {
        frontLanguage = 'tiếng Anh';
        backLanguage = 'tiếng Việt';
      } else if (newDeckSubject === 'Tiếng Pháp') {
        frontLanguage = 'tiếng Pháp';
        backLanguage = 'tiếng Việt';
      } else if (newDeckSubject === 'Tiếng Nhật') {
        frontLanguage = 'tiếng Nhật';
        backLanguage = 'tiếng Việt';
      } else if (newDeckSubject === 'Tiếng Trung') {
        frontLanguage = 'tiếng Trung';
        backLanguage = 'tiếng Việt';
      } else if (newDeckSubject === 'Tiếng Hàn') {
        frontLanguage = 'tiếng Hàn';
        backLanguage = 'tiếng Việt';
      } else {
        // Đối với các môn khác, mặc định sử dụng tiếng Anh - tiếng Việt
        frontLanguage = 'tiếng Anh';
        backLanguage = 'tiếng Việt';
      }

      // Tạo prompt cho AI để sinh flashcards
      const prompt = `Tạo flashcards môn ${newDeckSubject}, chủ đề ${newDeckTopic}. Hãy tạo ${cardCount} flashcard có chất lượng cao, mỗi flashcard có front (${frontLanguage}), back (${backLanguage}), example (câu ví dụ bằng ${frontLanguage}) và exampleTranslation (bản dịch của câu ví dụ sang ${backLanguage}).

Lưu ý quan trọng: 
1. Không sử dụng dấu ** hoặc markdown trong nội dung.
2. Câu ví dụ phải rõ ràng, ngắn gọn và dễ hiểu.
3. Bản dịch của câu ví dụ phải chính xác và tự nhiên.
4. KHÔNG ĐƯỢC sử dụng dấu gạch ngang (---) trong bất kỳ phần nào của bảng.
5. Trả lời dưới dạng bảng với 4 cột: Front | Back | Example | ExampleTranslation`;

      // Gọi API AI
      const aiResponse = await generateGeminiResponse(prompt);

      // Xử lý phản hồi từ AI để tạo flashcards
      interface AICard {
        id: string;
        front: string;
        back: string;
        example: string;
        exampleTranslation?: string;
        learned: boolean;
      }

      let cards: AICard[] = [];

      // Xử lý phản hồi từ AI để tạo flashcards
      try {
        // Tìm bảng Markdown trong phản hồi
        const tableRegex = /\|.*\|.*\|[\s\S]*?\n([\s\S]*?)(\n\n|$)/g;
        const tableMatch = tableRegex.exec(aiResponse);

        if (tableMatch && tableMatch[1]) {
          // Tách các hàng từ bảng
          const rows = tableMatch[1]
            .split('\n')
            .filter(row => row.trim() && row.includes('|'));

          cards = rows
            .map((row, index) => {
              const columns = row.split('|').filter(col => col.trim());

              // Đảm bảo có ít nhất 2 cột (front và back)
              if (columns.length >= 2) {
                // Loại bỏ dấu ngoặc kép và các ký hiệu markdown
                const cleanFront = columns[0]
                  .trim()
                  .replace(/^"(.*)"$/, '$1') // Loại bỏ dấu ngoặc kép
                  .replace(/\*\*/g, '') // Loại bỏ dấu **
                  .replace(/\*/g, '') // Loại bỏ dấu *
                  .replace(/`/g, '') // Loại bỏ dấu `
                  .replace(/^-+$/, '') // Loại bỏ dòng chỉ có dấu gạch ngang
                  .replace(/^-+\s*$/, ''); // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng

                const cleanBack = columns[1]
                  .trim()
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/`/g, '')
                  .replace(/^-+$/, '') // Loại bỏ dòng chỉ có dấu gạch ngang
                  .replace(/^-+\s*$/, ''); // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng

                let cleanExample = '';
                if (columns.length > 2) {
                  cleanExample = columns[2]
                    .trim()
                    .replace(/^"(.*)"$/, '$1')
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/`/g, '')
                    .replace(/^-+$/, '') // Loại bỏ dòng chỉ có dấu gạch ngang
                    .replace(/^-+\s*$/, ''); // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
                }

                let cleanExampleTranslation = '';
                if (columns.length > 3) {
                  cleanExampleTranslation = columns[3]
                    .trim()
                    .replace(/^"(.*)"$/, '$1')
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/`/g, '')
                    .replace(/^-+$/, '') // Loại bỏ dòng chỉ có dấu gạch ngang
                    .replace(/^-+\s*$/, ''); // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
                }

                // Kiểm tra nếu front hoặc back chỉ chứa dấu gạch ngang hoặc rỗng, bỏ qua card này
                if (
                  cleanFront.trim() === '' ||
                  cleanBack.trim() === '' ||
                  cleanFront.match(/^-+$/) ||
                  cleanBack.match(/^-+$/)
                ) {
                  return null;
                }

                return {
                  id: `ai-card-${Date.now()}-${index}`,
                  front: cleanFront,
                  back: cleanBack,
                  example: cleanExample,
                  exampleTranslation: cleanExampleTranslation,
                  learned: false,
                };
              }
              return null;
            })
            .filter(card => card !== null);
        }

        // Nếu không tìm thấy bảng hoặc không có cards hợp lệ, tạo một số flashcards mặc định
        if (cards.length === 0) {
          // Tìm các cặp từ và nghĩa trong văn bản
          const lines = aiResponse.split('\n');
          for (const line of lines) {
            if (line.includes('-') || line.includes(':')) {
              const parts = line.split(/[-:]/).map(part => part.trim());
              if (parts.length >= 2) {
                cards.push({
                  id: `ai-card-${Date.now()}-${cards.length}`,
                  front: parts[0].replace(/^"(.*)"$/, '$1'),
                  back: parts[1],
                  example: '',
                  exampleTranslation: '',
                  learned: false,
                });
              }
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }

      // Nếu vẫn không có cards, tạo một số flashcards mặc định
      if (cards.length === 0) {
        cards = [
          {
            id: `ai-card-${Date.now()}-1`,
            front: 'Example',
            back: 'Ví dụ',
            example: 'This is an example.',
            learned: false,
          },
          {
            id: `ai-card-${Date.now()}-2`,
            front: 'Flashcard',
            back: 'Thẻ ghi nhớ',
            example: 'I use flashcards to study.',
            learned: false,
          },
        ];
      }

      // Lưu thẻ đã tạo vào state để có thể chỉnh sửa
      setGeneratedCards(cards);

      // Hiển thị dialog chỉnh sửa thẻ
      setShowEditDialog(true);
      setAiDialogOpen(false);
      setCreatingDeck(false);

      // Các bước lưu deck sẽ được thực hiện sau khi người dùng xác nhận từ dialog chỉnh sửa
    } catch (error) {
      console.error('Failed to create AI flashcards:', error);
    } finally {
      setCreatingDeck(false);
    }
  };

  const currentCard = selectedDeck?.cards?.[currentCardIndex];

  if (currentView === 'player' && selectedDeck) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('list')}
              className="bg-transparent text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Badge variant="outline">
              {currentCardIndex + 1}/{selectedDeck.cards?.length || 0}
            </Badge>
          </div>
          <h2 className="text-[var(--text)]">{selectedDeck?.title}</h2>
        </div>

        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center p-6">
          {currentCard ? (
            <SwipeableFlashcard
              front={currentCard.front}
              back={currentCard.back}
              example={currentCard.example}
              exampleTranslation={currentCard.exampleTranslation}
              onSwipeLeft={() => markCardAsLearned(false)}
              onSwipeRight={() => markCardAsLearned(true)}
            />
          ) : (
            <div className="text-center text-[var(--muted)]">
              <p>Không có thẻ nào trong bộ này</p>
            </div>
          )}
        </div>

        {/* Controls */}
        {currentCard && (
          <div className="p-6 space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsFlipped(!isFlipped)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Lật thẻ
              </Button>

              <Button
                variant="outline"
                onClick={nextCard}
                disabled={
                  currentCardIndex === (selectedDeck.cards?.length || 0) - 1
                }
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="w-full bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              onClick={generateNewExample}
              disabled={generatingExample}
            >
              {generatingExample ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tạo câu ví dụ khác với AI
                </>
              )}
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--danger)] hover:bg-[rgb(239_68_68/0.06)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl"
                onClick={() => markCardAsLearned(false)}
              >
                Chưa nhớ
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--success)] hover:bg-[rgb(34_197_94/0.08)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl"
                onClick={() => markCardAsLearned(true)}
              >
                Đã nhớ
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] overflow-y-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[var(--text)] mb-2">Flashcards</h1>
          <p className="text-[var(--muted)]">Chọn bộ thẻ để bắt đầu học</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setNewDeckTitle('');
              setNewDeckTopic('');
              setNewDeckSubject('');
              setGeneratedCards([
                {
                  id: `manual-card-${Date.now()}-0`,
                  front: '',
                  back: '',
                  example: '',
                  exampleTranslation: '',
                  learned: false,
                },
              ]);
              setShowEditDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo thủ công
          </Button>
          <Button
            onClick={() => setAiDialogOpen(true)}
            className="bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white rounded-xl flex items-center focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            Tạo với AI
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <BrainCircuit className="h-12 w-12 text-[var(--muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">
            Chưa có flashcard nào
          </h3>
          <p className="text-[var(--muted)] mb-6 max-w-sm">
            Tạo bộ flashcard đầu tiên để bắt đầu học từ vựng hiệu quả
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setNewDeckTitle('');
                setNewDeckTopic('');
                setNewDeckSubject('');
                setGeneratedCards([
                  {
                    id: `manual-card-${Date.now()}-0`,
                    front: '',
                    back: '',
                    example: '',
                    exampleTranslation: '',
                    learned: false,
                  },
                ]);
                setShowEditDialog(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo thủ công
            </Button>
            <Button
              onClick={() => setAiDialogOpen(true)}
              className="bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white rounded-xl flex items-center focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              Tạo với AI
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {decks.map(deck => {
            const progress =
              deck.total > 0 ? (deck.learned / deck.total) * 100 : 0;

            return (
              <Card
                key={deck.id}
                className="bg-[var(--card)] border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => startDeck(deck)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${deck.color} mr-3`}
                      />
                      <div>
                        <CardTitle className="text-[var(--text)]">
                          {deck.title}
                        </CardTitle>
                        <CardDescription>{deck.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {deck.learned}/{deck.total}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[rgb(239_68_68/0.06)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        onClick={e => {
                          e.stopPropagation();
                          setDeckToDelete(deck);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--muted)]">Tiến trình</span>
                      <span className="text-[var(--muted)]">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-[rgba(0,0,0,.08)] dark:bg-[rgba(255,255,255,.08)] rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[color:rgb(37_99_235_/_0.8)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      startDeck(deck);
                    }}
                    className="h-11 w-full rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    disabled={!deck.cards || deck.cards.length === 0}
                  >
                    {deck.cards?.length > 0 ? 'Bắt đầu học' : 'Chưa có thẻ'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog tạo flashcards bằng AI */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[var(--surface)] border-[var(--border)] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">
              Tạo flashcards bằng AI
            </DialogTitle>
            <DialogDescription className="text-[var(--muted)]">
              Nhập thông tin để AI tạo bộ flashcards mới cho bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="subject"
                className="text-right text-[var(--text)] font-medium"
              >
                Môn học
              </Label>
              <Input
                id="subject"
                value={newDeckSubject}
                onChange={e => setNewDeckSubject(e.target.value)}
                placeholder="Ví dụ: Tiếng Anh, Toán học, Vật lý..."
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="topic"
                className="text-right text-[var(--text)] font-medium"
              >
                Chủ đề
              </Label>
              <Input
                id="topic"
                value={newDeckTopic}
                onChange={e => setNewDeckTopic(e.target.value)}
                className="col-span-3"
                placeholder="Từ vựng học thuật, Ngữ pháp cơ bản..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="title"
                className="text-right text-[var(--text)] font-medium"
              >
                Tiêu đề
              </Label>
              <Input
                id="title"
                value={newDeckTitle}
                onChange={e => setNewDeckTitle(e.target.value)}
                className="col-span-3"
                placeholder="Tiêu đề cho bộ flashcards"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="cardCount"
                className="text-right text-[var(--text)] font-medium"
              >
                Số lượng thẻ
              </Label>
              <div className="flex items-center col-span-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCardCount(Math.max(1, cardCount - 1))}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{cardCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCardCount(Math.min(20, cardCount + 1))}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={createAIFlashcards}
              disabled={
                creatingDeck || !newDeckTitle.trim() || !newDeckTopic.trim()
              }
              className="bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white font-medium focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {creatingDeck ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Tạo flashcards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa flashcard */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[var(--surface)] border-[var(--border)] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-[var(--text)]">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)] mr-2" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--muted)]">
              Bạn có chắc chắn muốn xóa bộ flashcard &quot;{deckToDelete?.title}
              &quot;? Hành động này không thể hoàn tác và tất cả các thẻ trong
              bộ này sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[var(--text)] bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface)]/80">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white font-medium focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              onClick={() => handleDeleteDeck()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog chỉnh sửa flashcards */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-[var(--surface)] border-[var(--border)] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">
              Chỉnh sửa flashcards
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Chỉnh sửa các flashcard trước khi lưu vào bộ sưu tập của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {generatedCards.map((card, index) => (
              <div key={card.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Thẻ #{index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        const updatedCards = generatedCards.filter(
                          (_, i) => i !== index,
                        );
                        setGeneratedCards(updatedCards);
                      }}
                      disabled={generatedCards.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`front-${index}`}>Mặt trước</Label>
                    <Input
                      id={`front-${index}`}
                      value={card.front}
                      onChange={e => {
                        const updatedCards = [...generatedCards];
                        updatedCards[index].front = e.target.value;
                        setGeneratedCards(updatedCards);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`back-${index}`}>Mặt sau</Label>
                    <Input
                      id={`back-${index}`}
                      value={card.back}
                      onChange={e => {
                        const updatedCards = [...generatedCards];
                        updatedCards[index].back = e.target.value;
                        setGeneratedCards(updatedCards);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`example-${index}`}>
                      Ví dụ (mặt trước)
                    </Label>
                    <Input
                      id={`example-${index}`}
                      value={card.example}
                      onChange={e => {
                        const updatedCards = [...generatedCards];
                        updatedCards[index].example = e.target.value;
                        setGeneratedCards(updatedCards);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exampleTranslation-${index}`}>
                      Ví dụ (mặt sau)
                    </Label>
                    <Input
                      id={`exampleTranslation-${index}`}
                      value={card.exampleTranslation || ''}
                      onChange={e => {
                        const updatedCards = [...generatedCards];
                        updatedCards[index].exampleTranslation = e.target.value;
                        setGeneratedCards(updatedCards);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setGeneratedCards([
                  ...generatedCards,
                  {
                    id: `ai-card-${Date.now()}-${generatedCards.length}`,
                    front: '',
                    back: '',
                    example: '',
                    exampleTranslation: '',
                    learned: false,
                  },
                ]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm thẻ mới
            </Button>

            <Button
              onClick={async () => {
                // Tạo deck mới
                const newDeck = {
                  title: newDeckTitle,
                  description: `${newDeckSubject} - ${newDeckTopic}`,
                  userId: auth.currentUser
                    ? auth.currentUser.uid
                    : 'local-user',
                  cards: generatedCards,
                  total: generatedCards.length,
                  learned: 0,
                  createdAt: new Date(),
                };

                // Tạo ID và color cho deck mới
                let deckId = `local-${Date.now()}`;
                const randomColor = [
                  'blue',
                  'green',
                  'purple',
                  'pink',
                  'yellow',
                ][Math.floor(Math.random() * 5)];

                // Lưu vào Firestore nếu người dùng đã đăng nhập
                if (auth.currentUser) {
                  try {
                    const docRef = await addDoc(
                      collection(db, 'flashcard_decks'),
                      newDeck,
                    );
                    deckId = docRef.id;
                  } catch (dbError) {
                    console.error('Error saving to database:', dbError);
                  }
                }

                // Thêm deck mới vào state
                const deckWithColor = {
                  ...newDeck,
                  id: deckId,
                  color: `bg-${randomColor}-500`,
                };

                setDecks([...decks, deckWithColor]);

                // Reset form và đóng dialog
                setNewDeckTitle('');
                setNewDeckTopic('');
                setShowEditDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" /> Lưu bộ thẻ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
