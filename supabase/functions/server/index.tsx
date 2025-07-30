import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS and logging middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to verify user authentication
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', status: 401 }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  return { user, error: null, status: 200 }
}

// User registration endpoint
app.post('/make-server-1d3b8ecf/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('User registration error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Initialize user data
    const userId = data.user.id
    await kv.set(`user:${userId}:profile`, {
      name,
      email,
      streak: 0,
      todayProgress: 0,
      dailyGoal: 20,
      totalWordsLearned: 0,
      totalStudyTime: 0,
      level: 1,
      joinDate: new Date().toISOString()
    })

    // Initialize habits
    await kv.set(`user:${userId}:habits`, [
      {
        id: 1,
        title: 'Học 20 từ vựng mới',
        description: 'Mỗi ngày học 20 từ vựng mới',
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress: [false, false, false, false, false, false, false]
      },
      {
        id: 2,
        title: 'Nghe podcast 10 phút',
        description: 'Luyện nghe tiếng Anh mỗi ngày',
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress: [false, false, false, false, false, false, false]
      }
    ])

    return c.json({ 
      message: 'User created successfully',
      user: { id: userId, email, name }
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Get user profile
app.get('/make-server-1d3b8ecf/profile', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const profile = await kv.get(`user:${user.id}:profile`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json({ profile })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to get profile' }, 500)
  }
})

// Update user progress
app.post('/make-server-1d3b8ecf/progress', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const { wordsLearned, studyTime } = await c.req.json()
    
    const profile = await kv.get(`user:${user.id}:profile`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    // Update progress
    const updatedProfile = {
      ...profile,
      todayProgress: (profile.todayProgress || 0) + (wordsLearned || 0),
      totalWordsLearned: (profile.totalWordsLearned || 0) + (wordsLearned || 0),
      totalStudyTime: (profile.totalStudyTime || 0) + (studyTime || 0)
    }

    // Check if daily goal achieved to update streak
    if (updatedProfile.todayProgress >= updatedProfile.dailyGoal) {
      const today = new Date().toDateString()
      const lastStreakDate = await kv.get(`user:${user.id}:lastStreakDate`)
      
      if (lastStreakDate !== today) {
        updatedProfile.streak = (updatedProfile.streak || 0) + 1
        await kv.set(`user:${user.id}:lastStreakDate`, today)
      }
    }

    await kv.set(`user:${user.id}:profile`, updatedProfile)

    return c.json({ profile: updatedProfile })
  } catch (error) {
    console.log('Update progress error:', error)
    return c.json({ error: 'Failed to update progress' }, 500)
  }
})

// Get user habits
app.get('/make-server-1d3b8ecf/habits', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const habits = await kv.get(`user:${user.id}:habits`) || []
    return c.json({ habits })
  } catch (error) {
    console.log('Get habits error:', error)
    return c.json({ error: 'Failed to get habits' }, 500)
  }
})

// Update habit completion
app.post('/make-server-1d3b8ecf/habits/:habitId/toggle', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const habitId = parseInt(c.req.param('habitId'))
    const habits = await kv.get(`user:${user.id}:habits`) || []
    
    const habitIndex = habits.findIndex(h => h.id === habitId)
    if (habitIndex === -1) {
      return c.json({ error: 'Habit not found' }, 404)
    }

    // Toggle completion
    habits[habitIndex].todayCompleted = !habits[habitIndex].todayCompleted
    
    // Update weekly progress (shift array and add today's status)
    const weeklyProgress = [...habits[habitIndex].weeklyProgress]
    weeklyProgress.shift()
    weeklyProgress.push(habits[habitIndex].todayCompleted)
    habits[habitIndex].weeklyProgress = weeklyProgress

    // Update streak
    if (habits[habitIndex].todayCompleted) {
      habits[habitIndex].currentStreak = (habits[habitIndex].currentStreak || 0) + 1
    } else {
      habits[habitIndex].currentStreak = Math.max(0, (habits[habitIndex].currentStreak || 0) - 1)
    }

    await kv.set(`user:${user.id}:habits`, habits)

    return c.json({ habits })
  } catch (error) {
    console.log('Toggle habit error:', error)
    return c.json({ error: 'Failed to toggle habit' }, 500)
  }
})

// Get flashcard decks
app.get('/make-server-1d3b8ecf/flashcards', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    let decks = await kv.get(`user:${user.id}:flashcards`)
    
    // Initialize default decks if none exist
    if (!decks) {
      decks = [
        {
          id: 1,
          title: 'Du lịch',
          description: 'Từ vựng cần thiết cho chuyến đi',
          total: 50,
          learned: 0,
          cards: [
            { front: 'Beautiful', back: 'Đẹp, xinh đẹp', example: 'She has a beautiful smile.' },
            { front: 'Interesting', back: 'Thú vị, hấp dẫn', example: 'This book is very interesting.' },
            { front: 'Airport', back: 'Sân bay', example: 'I will meet you at the airport.' }
          ]
        },
        {
          id: 2,
          title: 'Công việc',
          description: 'Thuật ngữ văn phòng và nghề nghiệp',
          total: 75,
          learned: 0,
          cards: [
            { front: 'Meeting', back: 'Cuộc họp', example: 'We have a meeting at 3 PM.' },
            { front: 'Deadline', back: 'Hạn chót', example: 'The deadline is tomorrow.' }
          ]
        }
      ]
      await kv.set(`user:${user.id}:flashcards`, decks)
    }

    return c.json({ decks })
  } catch (error) {
    console.log('Get flashcards error:', error)
    return c.json({ error: 'Failed to get flashcards' }, 500)
  }
})

// Save chat message
app.post('/make-server-1d3b8ecf/chat', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const { message, sender } = await c.req.json()
    
    const chatHistory = await kv.get(`user:${user.id}:chat`) || []
    
    const newMessage = {
      id: Date.now(),
      content: message,
      sender,
      timestamp: new Date().toISOString()
    }
    
    chatHistory.push(newMessage)
    
    // Keep only last 100 messages
    if (chatHistory.length > 100) {
      chatHistory.shift()
    }
    
    await kv.set(`user:${user.id}:chat`, chatHistory)

    return c.json({ message: newMessage })
  } catch (error) {
    console.log('Save chat error:', error)
    return c.json({ error: 'Failed to save chat' }, 500)
  }
})

// Get chat history
app.get('/make-server-1d3b8ecf/chat', async (c) => {
  const { user, error, status } = await verifyUser(c.req.raw)
  if (error) return c.json({ error }, status)

  try {
    const chatHistory = await kv.get(`user:${user.id}:chat`) || []
    return c.json({ messages: chatHistory })
  } catch (error) {
    console.log('Get chat error:', error)
    return c.json({ error: 'Failed to get chat history' }, 500)
  }
})

// Reset daily progress (can be called by a cron job)
app.post('/make-server-1d3b8ecf/reset-daily', async (c) => {
  try {
    // This would typically be called by a daily cron job
    // For demo purposes, we'll just return success
    return c.json({ message: 'Daily reset completed' })
  } catch (error) {
    console.log('Reset daily error:', error)
    return c.json({ error: 'Failed to reset daily progress' }, 500)
  }
})

Deno.serve(app.fetch)