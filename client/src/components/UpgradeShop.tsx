import { useState, useEffect } from "react";
import { PersistentProgressionSystem } from "../lib/game/systems/PersistentProgressionSystem";

interface UpgradeShopProps {
  onClose: () => void;
}

export default function UpgradeShop({ onClose }: UpgradeShopProps) {
  const [data, setData] = useState(PersistentProgressionSystem.load());

  useEffect(() => {
    // Reload data when component mounts and set up interval to refresh
    const refreshData = () => {
      setData(PersistentProgressionSystem.load());
    };
    
    refreshData();
    const interval = setInterval(refreshData, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = (upgrade: keyof typeof data.permanentUpgrades) => {
    const success = PersistentProgressionSystem.upgradePermanent(upgrade);
    if (success) {
      setData(PersistentProgressionSystem.load());
    }
  };

  const upgrades = [
    { key: "maxHealth" as const, name: "Vitality", icon: "♥", description: "+10 max HP per level" },
    { key: "damage" as const, name: "Might", icon: "⚔", description: "+5% damage per level" },
    { key: "speed" as const, name: "Swiftness", icon: "◇", description: "+5% movement speed per level" },
    { key: "pickupRange" as const, name: "Magnetism", icon: "◈", description: "+10% XP pickup range per level" },
    { key: "luck" as const, name: "Fortune", icon: "★", description: "+5% better drops per level" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-10">
        <div className="gothic-divider mb-6" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="gothic-title text-3xl font-bold" style={{ color: '#c9a23f' }}>
            UPGRADES
          </h2>
          <div className="text-xl font-bold" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>
            <span style={{ color: '#8b8b8b' }}>Gold:</span> {data.currency}
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
                className="gothic-panel rounded-lg p-4 transition-all duration-300"
                style={{ borderColor: canAfford ? '#2b193d' : '#1b1a24' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" style={{ color: '#c9a23f' }}>{upgrade.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: '#d9d1c5', fontFamily: 'Cinzel, serif' }}>
                        {upgrade.name}
                      </h3>
                      <p className="text-xs" style={{ color: '#5c5c5c' }}>Level {level}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-3" style={{ color: '#8b8b8b' }}>{upgrade.description}</p>

                <button
                  onClick={() => handleUpgrade(upgrade.key)}
                  disabled={!canAfford}
                  className={`w-full px-4 py-2 rounded font-bold transition-all text-sm ${
                    canAfford
                      ? "gothic-button gothic-button-primary"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  style={!canAfford ? { background: '#1b1a24', border: '1px solid #2b193d', color: '#5c5c5c' } : {}}
                >
                  Upgrade — {cost} Gold
                </button>
              </div>
            );
          })}
        </div>

        <div className="gothic-panel rounded-lg p-4 mb-6" style={{ borderColor: '#2b193d' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#9b7cb8', fontFamily: 'Cinzel, serif' }}>
            Your Journey
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div style={{ color: '#8b8b8b' }}>Total Runs: <span style={{ color: '#d9d1c5' }}>{data.totalRuns}</span></div>
            <div style={{ color: '#8b8b8b' }}>Total Kills: <span style={{ color: '#d9d1c5' }}>{data.totalKills}</span></div>
            <div style={{ color: '#8b8b8b' }}>High Score: <span style={{ color: '#c9a23f' }}>{data.highScore}</span></div>
            <div style={{ color: '#8b8b8b' }}>Max Wave: <span style={{ color: '#d9d1c5' }}>{data.statistics.maxWave}</span></div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
        >
          Close
        </button>

        <div className="gothic-divider mt-6" />
      </div>
    </div>
  );
}