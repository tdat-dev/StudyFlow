import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Trophy, Award, Star, Crown, Medal, TrendingUp, Target, Clock } from 'lucide-react';
import { auth, db } from '../utils/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface RankingSystemProps {
  user: any;
  onUpdateUser?: (updatedUser: any) => void;
}

interface Rank {
  name: string;
  level: number;
  color: string;
  icon: React.ReactNode;
  minPoints: number;
  maxPoints: number;
}

export function RankingSystem({ user, onUpdateUser }: RankingSystemProps) {
  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState<Rank | null>(null);
  const [nextRank, setNextRank] = useState<Rank | null>(null);
  const [pointsToNextRank, setPointsToNextRank] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Định nghĩa các cấp bậc
  const ranks: Rank[] = [
    { 
      name: 'Người mới', 
      level: 1, 
      color: 'bg-gray-500', 
      icon: <Star className="h-5 w-5 text-gray-500" />, 
      minPoints: 0, 
      maxPoints: 99 
    },
    { 
      name: 'Học viên', 
      level: 2, 
      color: 'bg-green-500', 
      icon: <Medal className="h-5 w-5 text-green-500" />, 
      minPoints: 100, 
      maxPoints: 299 
    },
    { 
      name: 'Học giả', 
      level: 3, 
      color: 'bg-blue-500', 
      icon: <Award className="h-5 w-5 text-blue-500" />, 
      minPoints: 300, 
      maxPoints: 599 
    },
    { 
      name: 'Chuyên gia', 
      level: 4, 
      color: 'bg-purple-500', 
      icon: <Trophy className="h-5 w-5 text-purple-500" />, 
      minPoints: 600, 
      maxPoints: 999 
    },
    { 
      name: 'Bậc thầy', 
      level: 5, 
      color: 'bg-yellow-500', 
      icon: <Crown className="h-5 w-5 text-yellow-500" />, 
      minPoints: 1000, 
      maxPoints: Infinity 
    }
  ];

  useEffect(() => {
    loadUserRankData();
  }, [user]);

  const loadUserRankData = async () => {
    if (!user.accessToken || !auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const points = userData.rankPoints || 0;
        setUserPoints(points);
        
        // Tìm rank hiện tại và rank tiếp theo
        const currentRank = ranks.find(rank => 
          points >= rank.minPoints && points <= rank.maxPoints
        ) || ranks[0];
        
        setUserRank(currentRank);
        
        // Tìm rank tiếp theo
        const nextRankIndex = ranks.findIndex(r => r.name === currentRank.name) + 1;
        if (nextRankIndex < ranks.length) {
          const next = ranks[nextRankIndex];
          setNextRank(next);
          
          // Tính điểm cần để lên cấp tiếp theo
          const pointsNeeded = next.minPoints - points;
          setPointsToNextRank(pointsNeeded);
          
          // Tính phần trăm tiến trình
          const totalPointsInCurrentRank = currentRank.maxPoints - currentRank.minPoints;
          const pointsEarnedInCurrentRank = points - currentRank.minPoints;
          const progress = (pointsEarnedInCurrentRank / totalPointsInCurrentRank) * 100;
          setProgressPercent(Math.min(progress, 100));
        } else {
          // Đã đạt rank cao nhất
          setNextRank(null);
          setPointsToNextRank(0);
          setProgressPercent(100);
        }
        
        // Tải thành tựu
        setAchievements(userData.achievements || []);
      } else {
        // Nếu không có dữ liệu, tạo dữ liệu mới
        try {
          // Sử dụng setDoc thay vì updateDoc để tạo document mới
          const userRef = doc(db, "users", auth.currentUser.uid);
          const initialData = {
            rankPoints: 0,
            achievements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Import setDoc từ firebase/firestore
          const { setDoc } = await import('firebase/firestore');
          await setDoc(userRef, initialData, { merge: true });
          
          setUserPoints(0);
          setUserRank(ranks[0]);
          setNextRank(ranks[1]);
          setPointsToNextRank(ranks[1].minPoints);
          setProgressPercent(0);
          setAchievements([]);
        } catch (error) {
          console.error('Error creating user rank document:', error);
          // Sử dụng giá trị mặc định nếu không thể tạo document
          setUserPoints(0);
          setUserRank(ranks[0]);
          setNextRank(ranks[1]);
          setPointsToNextRank(ranks[1].minPoints);
          setProgressPercent(0);
          setAchievements([]);
        }
      }
    } catch (error) {
      console.error('Failed to load rank data:', error);
      // Sử dụng giá trị mặc định
      setUserPoints(0);
      setUserRank(ranks[0]);
      setNextRank(ranks[1]);
      setPointsToNextRank(ranks[1].minPoints);
      setProgressPercent(0);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Current Rank */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-900">Cấp độ hiện tại</CardTitle>
          <CardDescription>
            Tiếp tục học tập để nâng cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full ${userRank?.color || 'bg-gray-500'} flex items-center justify-center mr-4`}>
                {userRank?.icon || <Star className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-lg">{userRank?.name || 'Người mới'}</h3>
                <p className="text-sm text-gray-600">Cấp {userRank?.level || 1}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
              {userPoints} điểm
            </Badge>
          </div>
          
          {nextRank && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến trình</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Cần thêm {pointsToNextRank} điểm để đạt cấp {nextRank.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Achievements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-gray-900">Thành tích</CardTitle>
          <CardDescription>
            Những thành tích bạn đã đạt được
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có thành tích nào</p>
              <p className="text-sm text-gray-400">Tiếp tục học tập để mở khóa thành tích</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="border rounded-lg p-3 flex items-start">
                  <div className={`w-10 h-10 rounded-full ${achievement.color || 'bg-blue-100'} flex items-center justify-center mr-3`}>
                    {achievement.icon === 'streak' ? (
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    ) : achievement.icon === 'words' ? (
                      <Target className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Rank Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Hệ thống cấp bậc</CardTitle>
          <CardDescription>
            Các cấp bậc trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranks.map((rank) => (
              <div 
                key={rank.level} 
                className={`flex items-center p-3 rounded-lg border ${
                  userRank?.level === rank.level 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${rank.color} flex items-center justify-center mr-4`}>
                  <span className="text-white font-bold">{rank.level}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{rank.name}</h4>
                  <p className="text-xs text-gray-500">
                    {rank.minPoints} - {rank.maxPoints === Infinity ? '∞' : rank.maxPoints} điểm
                  </p>
                </div>
                {userRank?.level === rank.level && (
                  <Badge className="bg-blue-500">Hiện tại</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}