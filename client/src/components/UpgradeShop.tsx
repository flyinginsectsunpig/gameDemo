
import { useState } from "react";
import { PersistentProgressionSystem } from "../lib/game/systems/PersistentProgressionSystem";

interface UpgradeShopProps {
  onClose: () => void;
}

export default function UpgradeShop({ onClose }: UpgradeShopProps) {
  const [data, setData] = useState(PersistentProgressionSystem.load());

  const handleUpgrade = (upgrade: keyof typeof data.permanentUpgrades) => {
    const success = PersistentProgressionSystem.upgradePermanent(upgrade);
    if (success) {
      setData(PersistentProgressionSystem.load());
    }
  };

  const upgrades = [
    { key: "maxHealth" as const, name: "Max Health", icon: "❤️", description: "+10 max HP per level" },
    { key: "damage" as const, name: "Damage", icon: "⚔️", description: "+5% damage per level" },
    { key: "speed" as const, name: "Speed", icon: "🏃", description: "+5% movement speed per level" },
    { key: "pickupRange" as const, name: "Pickup Range", icon: "🧲", description: "+10% XP pickup range per level" },
    { key: "luck" as const, name: "Luck", icon: "🍀", description: "+5% better drops per level" },
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-purple-400">Permanent Upgrades</h2>
          <div className="text-2xl text-yellow-400 font-bold">
            💰 {data.currency}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {upgrades.map((upgrade) => {
            const level = data.permanentUpgrades[upgrade.key];
            const cost = PersistentProgressionSystem.getUpgradeCost(upgrade.key);
            const canAfford = data.currency >= cost;

            return (
              <div
                key={upgrade.key}
                className="bg-gray-800 border border-purple-400 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{upgrade.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{upgrade.name}</h3>
                      <p className="text-sm text-gray-400">Level {level}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{upgrade.description}</p>
                
                <button
                  onClick={() => handleUpgrade(upgrade.key)}
                  disabled={!canAfford}
                  className={`w-full px-4 py-2 rounded font-bold transition-all ${
                    canAfford
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Upgrade - 💰 {cost}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 border border-blue-400 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold text-blue-400 mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Total Runs: <span className="text-white">{data.totalRuns}</span></div>
            <div>Total Kills: <span className="text-white">{data.totalKills}</span></div>
            <div>High Score: <span className="text-white">{data.highScore}</span></div>
            <div>Max Wave: <span className="text-white">{data.statistics.maxWave}</span></div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
