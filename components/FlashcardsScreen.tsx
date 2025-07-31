import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth, db } from '../utils/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    if (!user.accessToken || !auth.currentUser) return;

    setLoading(true);
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
      const decksWithColors = serverDecks.map((deck, index) => ({
        ...deck,
        color: index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
      }));
      
      setDecks(decksWithColors);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      
      // Mock data for demo
      const mockDecks = [
        {
          id: "1",
          title: "Từ vựng cơ bản",
          description: "Các từ vựng thông dụng hàng ngày",
          total: 20,
          learned: 5,
          color: "bg-blue-500",
          cards: [
            { front: "Hello", back: "Xin chào", example: "Hello, how are you?" },
            { front: "Goodbye", back: "Tạm biệt", example: "Goodbye, see you tomorrow." },
            { front: "Thank you", back: "Cảm ơn", example: "Thank you for your help." }
          ]
        },
        {
          id: "2",
          title: "Ngữ pháp cơ bản",
          description: "Các cấu trúc ngữ pháp cơ bản",
          total: 15,
          learned: 3,
          color: "bg-green-500",
          cards: [
            { front: "Present Simple", back: "Thì hiện tại đơn", example: "I go to school every day." },
            { front: "Past Simple", back: "Thì quá khứ đơn", example: "I went to school yesterday." }
          ]
        }
      ];
      setDecks(mockDecks);
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
            <div 
              className="w-full max-w-sm aspect-[4/3] perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h3 className="text-blue-900 mb-4">{currentCard.front}</h3>
                    <p className="text-gray-500 text-sm">Nhấn để xem nghĩa</p>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h3 className="text-green-900 mb-2">{currentCard.back}</h3>
                    {currentCard.example && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{currentCard.example}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
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

            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl">
              <Sparkles className="h-4 w-4 mr-2" />
              Tạo câu ví dụ khác với AI
            </Button>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              >
                Chưa nhớ
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-green-200 text-green-600 hover:bg-green-50 rounded-xl"
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
      <div className="mb-6">
        <h1 className="text-blue-900 mb-2">Flashcards</h1>
        <p className="text-gray-600">Chọn bộ thẻ để bắt đầu học</p>
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
              <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${deck.color} mr-3`} />
                      <div>
                        <CardTitle className="text-gray-900">{deck.title}</CardTitle>
                        <CardDescription>{deck.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {deck.learned}/{deck.total}
                    </Badge>
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
                    onClick={() => startDeck(deck)}
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
    </div>
  );
}