
import { useEffect, useState } from "react";

interface AchievementNotificationProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
  } | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 border-2 border-yellow-300 rounded-lg p-4 shadow-2xl min-w-[300px]">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-yellow-100 uppercase">
              Achievement Unlocked!
            </div>
            <div className="text-lg font-bold text-white">
              {achievement.name}
            </div>
            <div className="text-sm text-yellow-50">
              {achievement.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
