import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Loader2, Plus, BrainCircuit, Trash2, AlertTriangle, Minus, Edit, Save } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth, db } from '../utils/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { generateGeminiResponse } from '../utils/gemini/config';
import { SwipeableFlashcard } from './SwipeableFlashcard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

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

export function FlashcardsScreen({ user }: FlashcardsScreenProps) {
  const [currentView, setCurrentView] = useState<'list' | 'player'>('list');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingExample, setGeneratingExample] = useState(false);
  
  // State cho AI Flashcard Creator
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckTopic, setNewDeckTopic] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('Tiếng Anh');
  const [cardCount, setCardCount] = useState(5);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cardLanguage, setCardLanguage] = useState('front-en-back-vi');
  
  // State cho xóa deck
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    if (!user.accessToken) return;

    setLoading(true);
    try {
      // Sử dụng dữ liệu mẫu trước để đảm bảo có dữ liệu hiển thị
      const mockDecks = [
        {
          id: "1",
          title: "Từ vựng cơ bản",
          description: "Các từ vựng thông dụng hàng ngày",
          total: 20,
          learned: 5,
          color: "bg-blue-500",
          cards: [
            { id: "1", front: "Hello", back: "Xin chào", example: "Hello, how are you?", learned: false },
            { id: "2", front: "Goodbye", back: "Tạm biệt", example: "Goodbye, see you tomorrow.", learned: false },
            { id: "3", front: "Thank you", back: "Cảm ơn", example: "Thank you for your help.", learned: false },
            { id: "4", front: "Please", back: "Làm ơn", example: "Please help me with this.", learned: false },
            { id: "5", front: "Sorry", back: "Xin lỗi", example: "I'm sorry for being late.", learned: false }
          ]
        }
      ];
      
      setDecks(mockDecks);
      
      // Nếu có auth.currentUser, thử tải dữ liệu từ Firestore
      if (auth.currentUser) {
        try {
          const flashcardsRef = collection(db, "flashcard_decks");
          const q = query(flashcardsRef, where("userId", "==", auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          const serverDecks: any[] = [];
          querySnapshot.forEach((doc) => {
            serverDecks.push({ 
              id: doc.id,
              ...doc.data()
            });
          });
          
          // Add colors to decks
          if (serverDecks.length > 0) {
            const decksWithColors = serverDecks.map((deck, index) => ({
              ...deck,
              color: index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
            }));
            
            setDecks(decksWithColors);
          }
        } catch (firebaseError) {
          console.error('Failed to load flashcards from Firebase:', firebaseError);
          // Đã sử dụng dữ liệu mẫu ở trên
        }
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

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
            : deck.learned - (card.learned ? 1 : 0)
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
    
    // Move to next card
    nextCard();
    
    // Update in Firestore (if not using mock data)
    if (auth.currentUser && selectedDeck.id && !selectedDeck.id.startsWith('local-')) {
      try {
        const deckRef = doc(db, "flashcard_decks", selectedDeck.id);
        await updateDoc(deckRef, {
          [`cards.${currentCardIndex}.learned`]: learned,
          learned: learned 
            ? selectedDeck.learned + (card.learned ? 0 : 1) 
            : selectedDeck.learned - (card.learned ? 1 : 0)
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
        // Gọi API Gemini
        newExample = await generateGeminiResponse(prompt);
        
        // Loại bỏ các ký hiệu markdown và làm sạch câu ví dụ
        newExample = newExample
          .replace(/\*\*/g, '')     // Loại bỏ dấu **
          .replace(/\*/g, '')       // Loại bỏ dấu *
          .replace(/`/g, '')        // Loại bỏ dấu `
          .replace(/^["'](.*)["']$/, '$1')  // Loại bỏ dấu ngoặc kép/đơn bao quanh
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
          `"${card.front}" is commonly used when talking about this topic.`
        ];
        newExample = newExamples[Math.floor(Math.random() * newExamples.length)];
      }
      
      // Update the card with a new example
      const updatedDecks = decks.map(deck => {
        if (deck.id === selectedDeck.id) {
          const updatedCards = deck.cards.map((c, idx) => {
            if (idx === currentCardIndex) {
              return { 
                ...c, 
                example: newExample
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
      if (auth.currentUser && deckToDelete.id && !deckToDelete.id.startsWith('local-')) {
        try {
          await deleteDoc(doc(db, "flashcard_decks", deckToDelete.id));
          // Không log ID của deck, chỉ log trạng thái
          console.log('Deck deleted successfully');
        } catch (error) {
          // Không log chi tiết lỗi vì có thể chứa thông tin nhạy cảm
          console.error('Error deleting deck from Firestore');
        }
      }
      
      // Đóng dialog
      setDeleteDialogOpen(false);
      setDeckToDelete(null);
      
    } catch (error) {
      // Không log chi tiết lỗi vì có thể chứa thông tin nhạy cảm
      console.error('Failed to delete deck');
    }
  };
  
  // Hàm tạo flashcards mới bằng AI
  const createAIFlashcards = async () => {
    if (!newDeckTitle.trim() || !newDeckTopic.trim() || !newDeckSubject.trim()) {
      return;
    }
    
    setCreatingDeck(true);
    
    try {
      // Tự động xác định ngôn ngữ dựa vào môn học
      let frontLanguage = "tiếng Anh";
      let backLanguage = "tiếng Việt";
      let selectedCardLanguage = "front-en-back-vi";
      
      // Tự động xác định ngôn ngữ dựa vào môn học
      if (newDeckSubject === "Tiếng Anh") {
        frontLanguage = "tiếng Anh";
        backLanguage = "tiếng Việt";
        selectedCardLanguage = "front-en-back-vi";
      } else if (newDeckSubject === "Tiếng Pháp") {
        frontLanguage = "tiếng Pháp";
        backLanguage = "tiếng Việt";
        selectedCardLanguage = "front-fr-back-vi";
      } else if (newDeckSubject === "Tiếng Nhật") {
        frontLanguage = "tiếng Nhật";
        backLanguage = "tiếng Việt";
        selectedCardLanguage = "front-jp-back-vi";
      } else if (newDeckSubject === "Tiếng Trung") {
        frontLanguage = "tiếng Trung";
        backLanguage = "tiếng Việt";
        selectedCardLanguage = "front-cn-back-vi";
      } else if (newDeckSubject === "Tiếng Hàn") {
        frontLanguage = "tiếng Hàn";
        backLanguage = "tiếng Việt";
        selectedCardLanguage = "front-kr-back-vi";
      } else {
        // Sử dụng ngôn ngữ đã chọn nếu không phải là môn ngoại ngữ
        if (cardLanguage === "front-vi-back-en") {
          frontLanguage = "tiếng Việt";
          backLanguage = "tiếng Anh";
        } else if (cardLanguage === "front-fr-back-vi") {
          frontLanguage = "tiếng Pháp";
          backLanguage = "tiếng Việt";
        } else if (cardLanguage === "front-vi-back-fr") {
          frontLanguage = "tiếng Việt";
          backLanguage = "tiếng Pháp";
        } else if (cardLanguage === "front-jp-back-vi") {
          frontLanguage = "tiếng Nhật";
          backLanguage = "tiếng Việt";
        } else if (cardLanguage === "front-vi-back-jp") {
          frontLanguage = "tiếng Việt";
          backLanguage = "tiếng Nhật";
        } else if (cardLanguage === "front-cn-back-vi") {
          frontLanguage = "tiếng Trung";
          backLanguage = "tiếng Việt";
        } else if (cardLanguage === "front-vi-back-cn") {
          frontLanguage = "tiếng Việt";
          backLanguage = "tiếng Trung";
        } else if (cardLanguage === "front-kr-back-vi") {
          frontLanguage = "tiếng Hàn";
          backLanguage = "tiếng Việt";
        } else if (cardLanguage === "front-vi-back-kr") {
          frontLanguage = "tiếng Việt";
          backLanguage = "tiếng Hàn";
        }
        selectedCardLanguage = cardLanguage;
      }
      
      // Cập nhật state cardLanguage để phản ánh ngôn ngữ đã xác định
      setCardLanguage(selectedCardLanguage);
      
      // Tạo prompt cho AI để sinh flashcards
      const prompt = `Tạo flashcards môn ${newDeckSubject}, chủ đề ${newDeckTopic}. Hãy tạo ${cardCount} flashcard có chất lượng cao, mỗi flashcard có front (${frontLanguage}), back (${backLanguage}), example (câu ví dụ bằng ${frontLanguage}) và exampleTranslation (bản dịch của câu ví dụ sang ${backLanguage}).

Lưu ý quan trọng: 
1. Không sử dụng dấu ** hoặc markdown trong nội dung.
2. Câu ví dụ phải rõ ràng, ngắn gọn và dễ hiểu.
3. Bản dịch của câu ví dụ phải chính xác và tự nhiên.
4. KHÔNG ĐƯỢC sử dụng dấu gạch ngang (---) trong bất kỳ phần nào của bảng.
5. Trả lời dưới dạng bảng với 4 cột: Front | Back | Example | ExampleTranslation`;
      
      // Gọi API Gemini
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
          const rows = tableMatch[1].split('\n').filter(row => row.trim() && row.includes('|'));
          
          cards = rows.map((row, index) => {
            const columns = row.split('|').filter(col => col.trim());
            
            // Đảm bảo có ít nhất 2 cột (front và back)
            if (columns.length >= 2) {
              // Loại bỏ dấu ngoặc kép và các ký hiệu markdown
              const cleanFront = columns[0].trim()
                .replace(/^"(.*)"$/, '$1')  // Loại bỏ dấu ngoặc kép
                .replace(/\*\*/g, '')       // Loại bỏ dấu **
                .replace(/\*/g, '')         // Loại bỏ dấu *
                .replace(/`/g, '')          // Loại bỏ dấu `
                .replace(/^-+$/, '')        // Loại bỏ dòng chỉ có dấu gạch ngang
                .replace(/^-+\s*$/, '');    // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
              
              const cleanBack = columns[1].trim()
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/`/g, '')
                .replace(/^-+$/, '')        // Loại bỏ dòng chỉ có dấu gạch ngang
                .replace(/^-+\s*$/, '');    // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
              
              let cleanExample = '';
              if (columns.length > 2) {
                cleanExample = columns[2].trim()
                  .replace(/^"(.*)"$/, '$1')
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/`/g, '')
                  .replace(/^-+$/, '')        // Loại bỏ dòng chỉ có dấu gạch ngang
                  .replace(/^-+\s*$/, '');    // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
              }
              
              let cleanExampleTranslation = '';
              if (columns.length > 3) {
                cleanExampleTranslation = columns[3].trim()
                  .replace(/^"(.*)"$/, '$1')
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/`/g, '')
                  .replace(/^-+$/, '')        // Loại bỏ dòng chỉ có dấu gạch ngang
                  .replace(/^-+\s*$/, '');    // Loại bỏ dòng chỉ có dấu gạch ngang và khoảng trắng
              }
              
              // Kiểm tra nếu front hoặc back chỉ chứa dấu gạch ngang hoặc rỗng, bỏ qua card này
              if (cleanFront.trim() === '' || cleanBack.trim() === '' || 
                  cleanFront.match(/^-+$/) || cleanBack.match(/^-+$/)) {
                return null;
              }
              
              return {
                id: `ai-card-${Date.now()}-${index}`,
                front: cleanFront,
                back: cleanBack,
                example: cleanExample,
                exampleTranslation: cleanExampleTranslation,
                learned: false
              };
            }
            return null;
          }).filter(card => card !== null);
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
                  learned: false
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
          { id: `ai-card-${Date.now()}-1`, front: "Example", back: "Ví dụ", example: "This is an example.", learned: false },
          { id: `ai-card-${Date.now()}-2`, front: "Flashcard", back: "Thẻ ghi nhớ", example: "I use flashcards to study.", learned: false },
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
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('list')}
              className="text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Badge variant="outline">
              {currentCardIndex + 1}/{selectedDeck.cards?.length || 0}
            </Badge>
          </div>
          <h2 className="text-blue-900">{selectedDeck?.title}</h2>
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
            <div className="text-center text-gray-500">
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
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsFlipped(!isFlipped)}
                className="rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Lật thẻ
              </Button>
              
              <Button
                variant="outline"
                onClick={nextCard}
                disabled={currentCardIndex === (selectedDeck.cards?.length || 0) - 1}
                className="rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
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
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                onClick={() => markCardAsLearned(false)}
              >
                Chưa nhớ
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-green-200 text-green-600 hover:bg-green-50 rounded-xl"
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
    <div className="h-full overflow-y-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-blue-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Chọn bộ thẻ để bắt đầu học</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              setNewDeckTitle('');
              setNewDeckTopic('');
              setNewDeckSubject('Tiếng Anh');
              setGeneratedCards([
                { 
                  id: `manual-card-${Date.now()}-0`, 
                  front: '', 
                  back: '', 
                  example: '', 
                  exampleTranslation: '',
                  learned: false 
                }
              ]);
              setCardLanguage('front-en-back-vi');
              setShowEditDialog(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo thủ công
          </Button>
          <Button 
            onClick={() => setAiDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center"
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            Tạo với AI
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {decks.map((deck) => {
            const progress = deck.total > 0 ? (deck.learned / deck.total) * 100 : 0;
            
            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startDeck(deck)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${deck.color} mr-3`} />
                      <div>
                        <CardTitle className="text-gray-900">{deck.title}</CardTitle>
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
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
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
                      <span className="text-gray-600">Tiến trình</span>
                      <span className="text-gray-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${deck.color}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      startDeck(deck);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo flashcards bằng AI</DialogTitle>
            <DialogDescription>
              Nhập thông tin để AI tạo bộ flashcards mới cho bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Môn học
              </Label>
              <select
                id="subject"
                value={newDeckSubject}
                onChange={(e) => setNewDeckSubject(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Toán học">Toán học</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
                <option value="Lịch sử">Lịch sử</option>
                <option value="Địa lý">Địa lý</option>
                <option value="Tin học">Tin học</option>
                <option value="Văn học">Văn học</option>
                <option value="Tiếng Pháp">Tiếng Pháp</option>
                <option value="Tiếng Nhật">Tiếng Nhật</option>
                <option value="Tiếng Trung">Tiếng Trung</option>
                <option value="Tiếng Hàn">Tiếng Hàn</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Chủ đề
              </Label>
              <Input
                id="topic"
                value={newDeckTopic}
                onChange={(e) => setNewDeckTopic(e.target.value)}
                className="col-span-3"
                placeholder="Từ vựng học thuật, Ngữ pháp cơ bản..."
              />
            </div>
            
            {/* Chỉ hiển thị lựa chọn ngôn ngữ cho các môn không phải ngoại ngữ */}
            {!["Tiếng Anh", "Tiếng Pháp", "Tiếng Nhật", "Tiếng Trung", "Tiếng Hàn"].includes(newDeckSubject) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cardLanguage" className="text-right">
                  Ngôn ngữ
                </Label>
                <select
                  id="cardLanguage"
                  value={cardLanguage}
                  onChange={(e) => setCardLanguage(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="front-en-back-vi">Tiếng Anh - Tiếng Việt</option>
                  <option value="front-vi-back-en">Tiếng Việt - Tiếng Anh</option>
                  <option value="front-fr-back-vi">Tiếng Pháp - Tiếng Việt</option>
                  <option value="front-vi-back-fr">Tiếng Việt - Tiếng Pháp</option>
                  <option value="front-jp-back-vi">Tiếng Nhật - Tiếng Việt</option>
                  <option value="front-vi-back-jp">Tiếng Việt - Tiếng Nhật</option>
                  <option value="front-cn-back-vi">Tiếng Trung - Tiếng Việt</option>
                  <option value="front-vi-back-cn">Tiếng Việt - Tiếng Trung</option>
                  <option value="front-kr-back-vi">Tiếng Hàn - Tiếng Việt</option>
                  <option value="front-vi-back-kr">Tiếng Việt - Tiếng Hàn</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Tiêu đề
              </Label>
              <Input
                id="title"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                className="col-span-3"
                placeholder="Tiêu đề cho bộ flashcards"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardCount" className="text-right">
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
              disabled={creatingDeck || !newDeckTitle.trim() || !newDeckTopic.trim()}
              className="bg-yellow-500 hover:bg-yellow-600"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bộ flashcard "{deckToDelete?.title}"? 
              Hành động này không thể hoàn tác và tất cả các thẻ trong bộ này sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeleteDeck()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog chỉnh sửa flashcards */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa flashcards</DialogTitle>
            <DialogDescription>
              Chỉnh sửa các flashcard trước khi lưu vào bộ sưu tập của bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {generatedCards.map((card, index) => (
              <div key={card.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Thẻ #{index + 1}</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                                <div>
                <Label htmlFor={`front-${index}`}>Mặt trước</Label>
                <Input 
                  id={`front-${index}`}
                  value={card.front}
                  onChange={(e) => {
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
                  onChange={(e) => {
                    const updatedCards = [...generatedCards];
                    updatedCards[index].back = e.target.value;
                    setGeneratedCards(updatedCards);
                  }}
                />
              </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`example-${index}`}>Ví dụ (mặt trước)</Label>
                    <Input 
                      id={`example-${index}`}
                      value={card.example}
                      onChange={(e) => {
                        const updatedCards = [...generatedCards];
                        updatedCards[index].example = e.target.value;
                        setGeneratedCards(updatedCards);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exampleTranslation-${index}`}>Ví dụ (mặt sau)</Label>
                    <Input 
                      id={`exampleTranslation-${index}`}
                      value={card.exampleTranslation || ''}
                      onChange={(e) => {
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
                setGeneratedCards([...generatedCards, { 
                  id: `ai-card-${Date.now()}-${generatedCards.length}`, 
                  front: '', 
                  back: '', 
                  example: '', 
                  exampleTranslation: '',
                  learned: false 
                }]);
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
                  userId: auth.currentUser ? auth.currentUser.uid : 'local-user',
                  cards: generatedCards,
                  total: generatedCards.length,
                  learned: 0,
                  createdAt: new Date()
                };
                
                // Tạo ID và color cho deck mới
                let deckId = `local-${Date.now()}`;
                const randomColor = ['blue', 'green', 'purple', 'pink', 'yellow'][Math.floor(Math.random() * 5)];
                
                // Lưu vào Firestore nếu người dùng đã đăng nhập
                if (auth.currentUser) {
                  try {
                    const docRef = await addDoc(collection(db, "flashcard_decks"), newDeck);
                    deckId = docRef.id;
                  } catch (dbError) {
                    console.error('Error saving to database:', dbError);
                  }
                }
                
                // Thêm deck mới vào state
                const deckWithColor = {
                  ...newDeck,
                  id: deckId,
                  color: `bg-${randomColor}-500`
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