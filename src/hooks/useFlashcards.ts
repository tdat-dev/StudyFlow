import { useState, useEffect, useCallback } from 'react';
// Define types locally
interface Flashcard {
  id: string;
  front: string;
  back: string;
  example: string;
  exampleTranslation?: string;
  learned: boolean;
}

interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  color: string;
  cards: Flashcard[];
  total: number;
  learned: number;
  userId?: string;
  createdAt?: string;
}
import { User } from '../types/chat';
// Mock Firebase functions
const getFlashcardDecks = async (token: string): Promise<FlashcardDeck[]> => {
  return [];
};

const createFlashcardDeck = async (token: string, deck: Partial<FlashcardDeck>): Promise<string> => {
  return 'mock-deck-id';
};

const deleteFlashcardDeck = async (deckId: string): Promise<void> => {
  return;
};

const updateFlashcard = async (deckId: string, cardId: string, learned: boolean): Promise<void> => {
  return;
};

// Mock AI function
const generateAIResponse = async (prompt: string, user: any): Promise<string> => {
  return JSON.stringify({
    cards: [
      {
        front: 'Hello',
        back: 'Xin chào',
        example: 'Hello, how are you today?',
        exampleTranslation: 'Xin chào, hôm nay bạn khỏe không?'
      }
    ]
  });
};

export function useFlashcards(user: User) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm tạo ID duy nhất
  const generateUniqueId = (prefix: string = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Định nghĩa hàm loadMockFlashcards
  const loadMockFlashcards = () => {
    const mockDecks: FlashcardDeck[] = [
      {
        id: 'local-1',
        title: 'English Essentials',
        description: 'Basic English vocabulary for daily conversations',
        color: 'bg-blue-500',
        cards: [
          {
            id: 'local-card-1',
            front: 'Hello',
            back: 'Xin chào',
            example: 'Hello, how are you today?',
            exampleTranslation: 'Xin chào, hôm nay bạn khỏe không?',
            learned: false
          },
          {
            id: 'local-card-2',
            front: 'Thank you',
            back: 'Cảm ơn',
            example: 'Thank you for your help.',
            exampleTranslation: 'Cảm ơn vì sự giúp đỡ của bạn.',
            learned: false
          }
        ],
        total: 2,
        learned: 0
      }
    ];
    
    setDecks(mockDecks);
  };

  // Định nghĩa hàm loadFlashcards với useCallback
  const loadFlashcards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.accessToken) {
        // Load mock data if no user is logged in
        loadMockFlashcards();
        return;
      }

      const serverDecks = await getFlashcardDecks(user.accessToken);
      
      if (serverDecks.length === 0) {
        await createDefaultFlashcardDeck();
        return;
      }
      
      setDecks(serverDecks);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load flashcards:', err);
      }
      setError('Failed to load flashcards');
      loadMockFlashcards();
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Định nghĩa hàm createDefaultFlashcardDeck
  const createDefaultFlashcardDeck = async () => {
    if (!user?.accessToken) return;
    
    try {
      const defaultDeck: Partial<FlashcardDeck> = {
        title: 'English Essentials',
        description: 'Basic English vocabulary for daily conversations',
        cards: [
          {
            id: generateUniqueId('card'),
            front: 'Hello',
            back: 'Xin chào',
            example: 'Hello, how are you today?',
            exampleTranslation: 'Xin chào, hôm nay bạn khỏe không?',
            learned: false
          },
          {
            id: generateUniqueId('card'),
            front: 'Thank you',
            back: 'Cảm ơn',
            example: 'Thank you for your help.',
            exampleTranslation: 'Cảm ơn vì sự giúp đỡ của bạn.',
            learned: false
          }
        ]
      };
      
      await createFlashcardDeck(user.accessToken, defaultDeck);
      await loadFlashcards();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create default flashcard deck:', err);
      }
      setError('Failed to create default flashcard deck');
    }
  };

  // Gọi loadFlashcards khi user thay đổi
  useEffect(() => {
    if (user?.accessToken) {
      loadFlashcards();
    }
  }, [user, loadFlashcards]);

  const createDeck = async (title: string, description: string) => {
    if (!user?.accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newDeck: Partial<FlashcardDeck> = {
        title,
        description,
        cards: []
      };
      
      await createFlashcardDeck(user.accessToken, newDeck);
      await loadFlashcards();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create flashcard deck:', err);
      }
      setError('Failed to create flashcard deck');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user?.accessToken && !deckId.startsWith('local-')) return;
    
    try {
      // Update local state first for immediate UI feedback
      setDecks(decks.filter(deck => deck.id !== deckId));
      
      // Then delete from Firestore if it's not a local deck
      if (user?.accessToken && !deckId.startsWith('local-')) {
        await deleteFlashcardDeck(deckId);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete flashcard deck:', err);
      }
      setError('Failed to delete flashcard deck');
      // Reload to ensure UI is in sync with server
      await loadFlashcards();
    }
  };

  const markCardAsLearned = async (deckId: string, cardId: string, learned: boolean) => {
    if (!deckId || !cardId) return;
    
    try {
      // Update local state first for immediate UI feedback
      const updatedDecks = decks.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = deck.cards.map(card => {
            if (card.id === cardId) {
              return { ...card, learned };
            }
            return card;
          });
          
          const learnedCount = updatedCards.filter(card => card.learned).length;
          
          return {
            ...deck,
            cards: updatedCards,
            learned: learnedCount
          };
        }
        return deck;
      });
      
      setDecks(updatedDecks);
      
      // Then update Firestore if it's not a local deck
      if (user?.accessToken && !deckId.startsWith('local-')) {
        await updateFlashcard(deckId, cardId, learned);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update flashcard:', err);
      }
      setError('Failed to update flashcard');
      // Reload to ensure UI is in sync with server
      await loadFlashcards();
    }
  };

  const generateFlashcards = async (topic: string, subject: string, count: number) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create prompt for AI
      const prompt = `Tạo ${count} flashcard về chủ đề "${topic}" cho môn học "${subject}".

      Mỗi flashcard phải có:
      1. Front: Từ/khái niệm/câu hỏi (tiếng Anh nếu là môn ngoại ngữ)
      2. Back: Định nghĩa/giải thích/câu trả lời (tiếng Việt nếu là môn ngoại ngữ)
      3. Example: Ví dụ cụ thể về cách sử dụng (tiếng Anh nếu là môn ngoại ngữ)
      4. ExampleTranslation: Bản dịch của ví dụ (tiếng Việt nếu là môn ngoại ngữ)
      
      Trả về kết quả dưới dạng JSON array với cấu trúc như sau:
      
      [
        {
          "front": "Hello",
          "back": "Xin chào",
          "example": "Hello, how are you?",
          "exampleTranslation": "Xin chào, bạn khỏe không?"
        },
        ...
      ]`;
      
      // Call AI API
      const aiResponse = await generateAIResponse(prompt, user);
      
      // Parse AI response
      let flashcards: Partial<Flashcard>[] = [];
      
      try {
        // Find JSON array in response
        const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0]
            .replace(/^-+$/, '') // Remove markdown separators
            .replace(/^-+\s*$/, ''); // Remove markdown separators with whitespace
            
          flashcards = JSON.parse(jsonStr);
          
          // Add unique IDs
          flashcards = flashcards.map(card => ({
            ...card,
            id: generateUniqueId('card'),
            learned: false
          }));
        } else {
          throw new Error('Could not parse AI response');
        }
      } catch (parseError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to parse AI response:', parseError);
        }
        throw new Error('Failed to parse AI response');
      }
      
      return flashcards as Flashcard[];
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to generate flashcards:', err);
      }
      setError('Failed to generate flashcards');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    decks,
    loading,
    error,
    loadFlashcards,
    createDeck,
    deleteDeck,
    markCardAsLearned,
    generateFlashcards
  };
}