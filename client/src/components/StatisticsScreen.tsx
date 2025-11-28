
import { useState, useEffect } from "react";
import { StatisticsSystem } from "../lib/game/systems/StatisticsSystem";

interface StatisticsScreenProps {
  onClose: () => void;
}

export default function StatisticsScreen({ onClose }: StatisticsScreenProps) {
  const [stats, setStats] = useState(StatisticsSystem.load());

  useEffect(() => {
    // Reload statistics when component mounts
    setStats(StatisticsSystem.load());
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel p-8 rounded-lg max-w-4xl w-full my-8 relative z-10">
        <div className="gothic-divider mb-6" />
        
        <h1 className="gothic-title text-4xl font-bold text-center mb-8" style={{ color: '#c9a23f' }}>
          STATISTICS
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="gothic-panel p-5 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#9b7cb8', fontFamily: 'Cinzel, serif' }}>
              Overall
            </h2>
            <div className="space-y-2">
              <StatRow label="Total Runs" value={stats.totalRuns.toLocaleString()} />
              <StatRow label="Total Kills" value={stats.totalKills.toLocaleString()} />
              <StatRow label="Bosses Defeated" value={stats.bossesDefeated.toLocaleString()} />
              <StatRow label="Total Deaths" value={stats.totalDeaths.toLocaleString()} />
              <StatRow label="Total Play Time" value={formatTime(stats.totalPlayTime)} />
            </div>
          </div>

          <div className="gothic-panel p-5 rounded-lg" style={{ borderColor: '#5c1f2a' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>
              Records
            </h2>
            <div className="space-y-2">
              <StatRow label="Highest Score" value={stats.highestScore.toLocaleString()} color="#c9a23f" />
              <StatRow label="Highest Wave" value={stats.highestWave.toString()} color="#9b7cb8" />
              <StatRow label="Highest Level" value={stats.highestLevel.toString()} color="#7cb87c" />
              <StatRow label="Longest Combo" value={`${stats.longestCombo}x`} color="#c9a23f" />
              <StatRow label="Weapons Unlocked" value={stats.weaponsUnlocked.length.toString()} color="#7cb87c" />
            </div>
          </div>

          <div className="gothic-panel p-5 rounded-lg" style={{ borderColor: '#5c1f2a' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#8b2635', fontFamily: 'Cinzel, serif' }}>
              Combat
            </h2>
            <div className="space-y-2">
              <StatRow label="Damage Dealt" value={Math.floor(stats.totalDamageDealt).toLocaleString()} />
              <StatRow label="Damage Taken" value={Math.floor(stats.totalDamageTaken).toLocaleString()} />
              <StatRow label="Experience Gained" value={stats.totalExperienceGained.toLocaleString()} />
              <StatRow label="Avg Kills/Run" value={stats.totalRuns > 0 ? Math.floor(stats.totalKills / stats.totalRuns).toString() : "0"} />
            </div>
          </div>

          <div className="gothic-panel p-5 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7cb87c', fontFamily: 'Cinzel, serif' }}>
              Progress
            </h2>
            <div className="space-y-2">
              <StatRow label="Achievements" value={`${stats.achievementsEarned.length}/50`} color="#c9a23f" />
              <StatRow label="Weapons" value={`${stats.weaponsUnlocked.length}/15`} color="#9b7cb8" />
              <StatRow label="Characters Used" value={Object.keys(stats.characterStats).length.toString()} />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="gothic-button gothic-button-primary w-full px-6 py-3 rounded-lg text-sm"
        >
          Close
        </button>
        
        <div className="gothic-divider mt-6" />
      </div>
    </div>
  );
}

function StatRow({ label, value, color = "#d9d1c5" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: '#8b8b8b' }}>{label}:</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
