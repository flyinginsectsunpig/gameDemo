
import { StatisticsSystem } from "../lib/game/systems/StatisticsSystem";

interface StatisticsScreenProps {
  onClose: () => void;
}

export default function StatisticsScreen({ onClose }: StatisticsScreenProps) {
  const stats = StatisticsSystem.load();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-purple-900 to-black p-8 rounded-lg border-4 border-purple-500 text-white max-w-4xl w-full my-8">
        <h1 className="text-5xl font-bold text-center mb-8 text-purple-400">Statistics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Stats */}
          <div className="bg-black bg-opacity-50 p-6 rounded-lg border-2 border-purple-400">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Overall</h2>
            <div className="space-y-2">
              <StatRow label="Total Runs" value={stats.totalRuns.toLocaleString()} />
              <StatRow label="Total Kills" value={stats.totalKills.toLocaleString()} />
              <StatRow label="Bosses Defeated" value={stats.bossesDefeated.toLocaleString()} />
              <StatRow label="Total Deaths" value={stats.totalDeaths.toLocaleString()} />
              <StatRow label="Total Play Time" value={formatTime(stats.totalPlayTime)} />
            </div>
          </div>

          {/* Records */}
          <div className="bg-black bg-opacity-50 p-6 rounded-lg border-2 border-yellow-400">
            <h2 className="text-2xl font-bold mb-4 text-yellow-300">Records</h2>
            <div className="space-y-2">
              <StatRow label="Highest Score" value={stats.highestScore.toLocaleString()} color="text-yellow-400" />
              <StatRow label="Highest Wave" value={stats.highestWave.toString()} color="text-blue-400" />
              <StatRow label="Highest Level" value={stats.highestLevel.toString()} color="text-purple-400" />
              <StatRow label="Longest Combo" value={`${stats.longestCombo}x`} color="text-orange-400" />
              <StatRow label="Weapons Unlocked" value={stats.weaponsUnlocked.length.toString()} color="text-green-400" />
            </div>
          </div>

          {/* Combat Stats */}
          <div className="bg-black bg-opacity-50 p-6 rounded-lg border-2 border-red-400">
            <h2 className="text-2xl font-bold mb-4 text-red-300">Combat</h2>
            <div className="space-y-2">
              <StatRow label="Damage Dealt" value={Math.floor(stats.totalDamageDealt).toLocaleString()} />
              <StatRow label="Damage Taken" value={Math.floor(stats.totalDamageTaken).toLocaleString()} />
              <StatRow label="Experience Gained" value={stats.totalExperienceGained.toLocaleString()} />
              <StatRow label="Avg Kills/Run" value={stats.totalRuns > 0 ? Math.floor(stats.totalKills / stats.totalRuns).toString() : "0"} />
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-black bg-opacity-50 p-6 rounded-lg border-2 border-green-400">
            <h2 className="text-2xl font-bold mb-4 text-green-300">Progress</h2>
            <div className="space-y-2">
              <StatRow label="Achievements" value={`${stats.achievementsEarned.length}/50`} color="text-green-400" />
              <StatRow label="Weapons" value={`${stats.weaponsUnlocked.length}/15`} color="text-blue-400" />
              <StatRow label="Characters Used" value={Object.keys(stats.characterStats).length.toString()} />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300">{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
