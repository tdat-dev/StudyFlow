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
      const prompt = `Tạo một câu ví dụ tiếng Anh KHÁC với câu hiện tại "${card.example || ''}" sử dụng từ hoặc cụm từ "${card.front}" (nghĩa: "${card.back}"). Câu ví dụ nên:
- Ngắn gọn (10-15 từ)
- Rõ ràng và dễ hiểu
- Khác hoàn toàn với ví dụ cũ
- Phù hợp với ngữ cảnh thông thường
Chỉ trả về MỘT câu ví dụ, không có markdown.`;

      let newExample;
      let exampleTranslation;

      try {
        // Gọi API AI để tạo ví dụ mới
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

        // Tạo bản dịch tiếng Việt cho ví dụ mới
        const translationPrompt = `Hãy dịch câu tiếng Anh sau sang tiếng Việt một cách tự nhiên và dễ hiểu: "${newExample}"`;
        try {
          exampleTranslation = await generateGeminiResponse(translationPrompt);
          exampleTranslation = exampleTranslation
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '')
            .replace(/^["'](.*)["']$/, '$1')
            .trim();
        } catch (translationError) {
          console.error('Error translating example:', translationError);
          exampleTranslation = `Ví dụ với "${card.front}"`;
        }
      } catch (aiError) {
        console.error('Error calling AI:', aiError);
        // Fallback nếu API lỗi - tạo ví dụ khác
        const newExamples = [
          `I often use "${card.front}" in my conversations.`,
          `The word "${card.front}" is very useful in daily life.`,
          `Can you give me another example with "${card.front}"?`,
          `"${card.front}" appears frequently in English texts.`,
          `Let me show you how to use "${card.front}" properly.`,
        ];
        newExample =
          newExamples[Math.floor(Math.random() * newExamples.length)];
        exampleTranslation = `Ví dụ khác với từ "${card.front}"`;
      }

      // Update the card with new example and translation
      const updatedDecks = decks.map(deck => {
        if (deck.id === selectedDeck.id) {
          const updatedCards = deck.cards.map((c, idx) => {
            if (idx === currentCardIndex) {
              return {
                ...c,
                example: newExample,
                exampleTranslation: exampleTranslation,
              };
            }
            return c;
          });

          return { ...deck, cards: updatedCards };
        }
        return deck;
      });

      setDecks(updatedDecks);

      // Update selected deck để re-render ngay lập tức
      const updatedDeck = updatedDecks.find(d => d.id === selectedDeck.id);
      if (updatedDeck) {
        setSelectedDeck(updatedDeck);

        // Lưu vào Firestore nếu có user và deck không phải local
        if (
          auth.currentUser &&
          selectedDeck.id &&
          !selectedDeck.id.startsWith('local-')
        ) {
          try {
            const deckRef = doc(db, 'flashcard_decks', selectedDeck.id);
            await updateDoc(deckRef, {
              cards: updatedDeck.cards,
              updatedAt: new Date().toISOString(),
            });
            console.log('Updated deck in Firestore with new example');
          } catch (firestoreError) {
            console.error('Error updating Firestore:', firestoreError);
          }
        }
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

      // Bộ nhận diện ngôn ngữ từ chủ đề (không phân biệt hoa/thường, có bỏ dấu)
      const stripAccents = (s: string) =>
        (s || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
      const subjNorm = stripAccents(newDeckSubject);

      const isEnglish = /(tieng anh|english|en\b)/.test(subjNorm);
      const isFrench = /(tieng phap|phap|french|francais|francaise|fr\b)/.test(subjNorm);
      const isJapanese = /(tieng nhat|nhat|japanese|nihongo|jp\b)/.test(subjNorm);
      const isChinese = /(tieng trung|trung|hoa|chinese|mandarin|zh\b|han ngu)/.test(subjNorm);
      const isKorean = /(tieng han|han|korean|hangul|kr\b|han quoc)/.test(subjNorm);
      const isSpanish = /(tieng tay ban nha|tay ban nha|spanish|espanol|es\b)/.test(subjNorm);

      if (isEnglish) {
        frontLanguage = 'tiếng Anh';
        backLanguage = 'tiếng Việt';
      } else if (isFrench) {
        frontLanguage = 'tiếng Pháp';
        backLanguage = 'tiếng Việt';
      } else if (isJapanese) {
        frontLanguage = 'tiếng Nhật';
        backLanguage = 'tiếng Việt';
      } else if (isChinese) {
        frontLanguage = 'tiếng Trung';
        backLanguage = 'tiếng Việt';
      } else if (isKorean) {
        frontLanguage = 'tiếng Hàn';
        backLanguage = 'tiếng Việt';
      } else if (isSpanish) {
        frontLanguage = 'tiếng Tây Ban Nha';
        backLanguage = 'tiếng Việt';
      } else {
        // Đối với các môn khác, mặc định sử dụng tiếng Anh - tiếng Việt
        frontLanguage = 'tiếng Anh';
        backLanguage = 'tiếng Việt';
      }

      // Tạo prompt cho AI để sinh flashcards
      // Xây danh sách loại trừ từ đã có để tránh lặp giữa các lần tạo
      const normalizeForPrompt = (s: string) =>
        (s || '')
          .toLowerCase()
          .trim()
          .replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ')
          .replace(/[^\p{L}\p{N}]+/gu, ' ');
      const existingFrontsAll = (decks || [])
        .flatMap(d => (d?.cards || []).map((c: any) => c.front || ''))
        .filter(Boolean) as string[];
      const existingFrontsUnique = Array.from(
        new Set(existingFrontsAll.map(normalizeForPrompt)),
      );
      const exclusionSample = existingFrontsUnique
        .slice(-Math.min(60, existingFrontsUnique.length))
        .join(', ');
      const exclusionText = exclusionSample
        ? `\n      9. KHÔNG được dùng bất kỳ từ/cụm từ nào trong danh sách loại trừ sau (nếu có trùng, thay bằng từ khác cùng chủ đề): ${exclusionSample}`
        : '';

      const prompt = `Tạo flashcards môn ${newDeckSubject}, chủ đề ${newDeckTopic}. Hãy tạo CHÍNH XÁC ${cardCount} flashcard có chất lượng cao.

      RÀNG BUỘC NGÔN NGỮ (BẮT BUỘC):
      - Cột Front: viết bằng ${frontLanguage}.
      - Cột Back: viết bằng ${backLanguage}.
      - Cột Example: câu ví dụ viết bằng ${frontLanguage}.
      - Cột ExampleTranslation: bản dịch của câu ví dụ sang ${backLanguage}.

      Lưu ý quan trọng:
      1. Không sử dụng dấu ** hoặc markdown trong nội dung cell.
      2. Câu ví dụ phải rõ ràng, ngắn gọn và dễ hiểu.
      3. Bản dịch của câu ví dụ phải chính xác và tự nhiên.
      4. KHÔNG sử dụng dòng phân cách bằng dấu gạch ngang (---) trong bất kỳ phần nào.
      5. Trả lời DƯỚI DẠNG BẢNG với 4 cột (dùng ký tự | để phân tách cột): Front | Back | Example | ExampleTranslation.
      6. MỖI THẺ PHẢI LÀ MỘT TỪ/CỤM TỪ KHÁC NHAU – tuyệt đối KHÔNG trùng lặp từ vựng giữa các hàng.
      7. ĐA DẠNG chủ đề con và ngữ cảnh trong phạm vi chủ đề đã cho; không lặp lại cùng một từ dưới nhiều biến thể.
      8. Không thêm bất kỳ văn bản nào ngoài bảng.${exclusionText}`;

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
        // Tìm tất cả bảng Markdown trong phản hồi (nếu có nhiều)
        const tableRegex = /\|.*\|.*\|[\s\S]*?\n([\s\S]*?)(?:\n\n|$)/g;
        const tableMatches = Array.from(aiResponse.matchAll(tableRegex));

        const parsedCards: AICard[] = [];
        const normalize = (s: string) => s.toLowerCase().trim().replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ');
        const seenFronts = new Set<string>();

        for (const match of tableMatches) {
          const body = match[1] || '';
          const rows = body
            .split('\n')
            .map(r => r.trim())
            .filter(r => r && r.includes('|'));

          rows.forEach((row, index) => {
            const columns = row.split('|').map(col => col.trim()).filter(Boolean);

            // Bỏ qua header/tiêu đề nếu có hoặc hàng phân cách
            const firstCell = (columns[0] || '').toLowerCase();
            if (
              firstCell === 'front' ||
              firstCell === 'từ' ||
              /^-+$/.test(columns[0] || '') ||
              /^-+$/.test(columns[1] || '')
            ) {
              return;
            }

            if (columns.length >= 2) {
              const clean = (v: string) =>
                v
                  .replace(/^"(.*)"$/, '$1')
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/`/g, '')
                  .trim();

              const cleanFront = clean(columns[0]);
              const cleanBack = clean(columns[1]);
              const cleanExample = columns.length > 2 ? clean(columns[2]) : '';
              const cleanExampleTranslation = columns.length > 3 ? clean(columns[3]) : '';

              if (!cleanFront || !cleanBack) return;

              const normFront = normalize(cleanFront);
              if (seenFronts.has(normFront)) return; // loại trùng theo mặt trước
              seenFronts.add(normFront);

              parsedCards.push({
                id: `ai-card-${Date.now()}-${parsedCards.length}-${index}`,
                front: cleanFront,
                back: cleanBack,
                example: cleanExample,
                exampleTranslation: cleanExampleTranslation,
                learned: false,
              });
            }
          });
        }

        cards = parsedCards;

        // Loại các từ đã từng xuất hiện trong các deck trước để tránh lặp giữa các lần tạo
        if (existingFrontsUnique.length > 0) {
          const existingSet = new Set(existingFrontsUnique);
          const normalize = (s: string) =>
            (s || '')
              .toLowerCase()
              .trim()
              .replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ')
              .replace(/[^\p{L}\p{N}]+/gu, ' ');
          cards = cards.filter(c => !existingSet.has(normalize(c.front)));
        }

        // Xáo trộn ngẫu nhiên để tăng đa dạng trước khi cắt số lượng
        if (cards.length > 1) {
          cards = cards
            .map(c => ({ c, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map(({ c }) => c);
        }

        // Nếu không tìm thấy bảng hoặc không có cards hợp lệ, fallback: tìm cặp từ-nghĩa dạng "a - b" hoặc "a: b"
        if (cards.length === 0) {
          const lines = aiResponse.split('\n');
          const seen = new Set<string>();
          const norm = (s: string) => s.toLowerCase().trim().replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ');
          for (const line of lines) {
            if (line.includes('-') || line.includes(':')) {
              const parts = line.split(/[-:]/).map(part => part.trim());
              if (parts.length >= 2) {
                const front = parts[0].replace(/^"(.*)"$/, '$1');
                const back = parts[1];
                const key = norm(front);
                if (front && back && !seen.has(key)) {
                  seen.add(key);
                  cards.push({
                    id: `ai-card-${Date.now()}-${cards.length}`,
                    front,
                    back,
                    example: '',
                    exampleTranslation: '',
                    learned: false,
                  });
                }
              }
            }
          }
        }

        // Đảm bảo duy nhất theo front và giới hạn số lượng theo cardCount
        if (cards.length > 0) {
          const unique: AICard[] = [];
          const seen = new Set<string>();
          const keyOf = (s: string) => s.toLowerCase().trim().replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ');
          for (const c of cards) {
            const k = keyOf(c.front);
            if (!seen.has(k)) {
              seen.add(k);
              unique.push(c);
            }
          }
          cards = unique.slice(0, Math.max(1, cardCount));
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }

      // Nếu vẫn không có cards, báo lỗi cho người dùng
      if (cards.length === 0) {
        alert(
          'AI không thể tạo flashcard cho chủ đề này. Vui lòng thử lại hoặc thay đổi chủ đề!',
        );
        setCreatingDeck(false);
        return;
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
      <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--text)]">
        {/* Header */}
        <div className="flex-shrink-0 p-4 md:p-6 pb-2 md:pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('list')}
              className="bg-transparent text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Badge variant="outline" className="flex-shrink-0">
              {currentCardIndex + 1}/{selectedDeck.cards?.length || 0}
            </Badge>
          </div>
          <h2 className="text-[var(--text)] truncate">{selectedDeck?.title}</h2>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-24">
          {/* Flashcard */}
          <div className="flex items-center justify-center min-h-full py-6">
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

          {/* Navigation Controls */}
          {currentCard && (
            <div className="max-w-[736px] mx-auto px-4 py-4 space-y-4">
              <div className="flex justify-center space-x-2 md:space-x-4">
                <Button
                  variant="outline"
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={nextCard}
                  disabled={
                    currentCardIndex === (selectedDeck.cards?.length || 0) - 1
                  }
                  className="bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex space-x-2 md:space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--danger)] hover:bg-[rgb(239_68_68/0.06)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl text-xs md:text-sm min-w-0"
                  onClick={() => markCardAsLearned(false)}
                >
                  <span className="truncate">Chưa nhớ</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--success)] hover:bg-[rgb(34_197_94/0.08)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl text-xs md:text-sm min-w-0"
                  onClick={() => markCardAsLearned(true)}
                >
                  <span className="truncate">Đã nhớ</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        {currentCard && (
          <footer className="sticky bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
            <div className="mx-auto max-w-[736px] px-4 py-3 pb-safe">
              <button
                className="w-full h-11 rounded-xl bg-amber-500 text-white font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateNewExample}
                disabled={generatingExample}
              >
                {generatingExample ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>✨ Tạo câu ví dụ khác với AI</>
                )}
              </button>
            </div>
          </footer>
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
                // Làm sạch và khử trùng lặp trước khi lưu
                const normalize = (s: string) =>
                  (s || '')
                    .toLowerCase()
                    .trim()
                    .replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ')
                    .replace(/[^\p{L}\p{N}]+/gu, ' ');
                const uniqueCards: typeof generatedCards = [];
                const seen = new Set<string>();
                for (const c of generatedCards) {
                  const front = (c.front || '').trim();
                  const back = (c.back || '').trim();
                  if (!front || !back) continue;
                  const key = normalize(front);
                  if (!seen.has(key)) {
                    seen.add(key);
                    uniqueCards.push({
                      ...c,
                      front,
                      back,
                      example: (c.example || '').trim(),
                      exampleTranslation: (c.exampleTranslation || '').trim(),
                      learned: !!c.learned,
                    });
                  }
                }
                const finalCards = uniqueCards.slice(0, Math.max(1, cardCount));

                // Tạo deck mới
                const newDeck = {
                  title: newDeckTitle,
                  description: `${newDeckSubject} - ${newDeckTopic}`,
                  userId: auth.currentUser
                    ? auth.currentUser.uid
                    : 'local-user',
                  cards: finalCards,
                  total: finalCards.length,
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
