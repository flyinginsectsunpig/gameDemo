
import { useState } from "react";
import { SaveSystem } from "../lib/game/systems/SaveSystem";

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  effect: string;
}

const PERMANENT_UPGRADES: Upgrade[] = [
  {
    id: 'max_health',
    name: 'Vitality',
    description: 'Increases starting health',
    cost: 500,
    maxLevel: 10,
    effect: '+10 HP per level'
  },
  {
    id: 'damage_boost',
    name: 'Power',
    description: 'Increases all damage',
    cost: 750,
    maxLevel: 10,
    effect: '+5% damage per level'
  },
  {
    id: 'move_speed',
    name: 'Agility',
    description: 'Increases movement speed',
    cost: 600,
    maxLevel: 5,
    effect: '+10% speed per level'
  },
  {
    id: 'xp_gain',
    name: 'Wisdom',
    description: 'Increases XP gained',
    cost: 1000,
    maxLevel: 5,
    effect: '+10% XP per level'
  },
  {
    id: 'luck',
    name: 'Fortune',
    description: 'Better item drops',
    cost: 1500,
    maxLevel: 5,
    effect: '+5% drop rate per level'
  }
];

export default function UpgradeShop({ onClose }: { onClose: () => void }) {
  const saveData = SaveSystem.load();
  const [currency, setCurrency] = useState(saveData.stats.currency);
  const [upgrades, setUpgrades] = useState(saveData.stats.permanentUpgrades);

  const handleUpgrade = (upgradeId: string, cost: number) => {
    if (currency >= cost) {
      const currentLevel = upgrades[upgradeId] || 0;
      const newUpgrades = { ...upgrades, [upgradeId]: currentLevel + 1 };
      
      SaveSystem.spendCurrency(cost);
      SaveSystem.updateStats({ permanentUpgrades: newUpgrades });
      
      setCurrency(currency - cost);
      setUpgrades(newUpgrades);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400">Permanent Upgrades</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-red-400"
          >
            ×
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="text-xl text-yellow-300">
            💰 Currency: <span className="font-bold">{currency}</span>
          </div>
        </div>

        <div className="space-y-4">
          {PERMANENT_UPGRADES.map(upgrade => {
            const currentLevel = upgrades[upgrade.id] || 0;
            const canUpgrade = currentLevel < upgrade.maxLevel && currency >= upgrade.cost;
            const isMaxed = currentLevel >= upgrade.maxLevel;

            return (
              <div
                key={upgrade.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{upgrade.name}</h3>
                    <p className="text-sm text-gray-400">{upgrade.description}</p>
                    <p className="text-xs text-blue-400 mt-1">{upgrade.effect}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Level {currentLevel}/{upgrade.maxLevel}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="text-yellow-400 font-bold">
                    💰 {upgrade.cost * (currentLevel + 1)}
                  </div>
                  <button
                    onClick={() => handleUpgrade(upgrade.id, upgrade.cost * (currentLevel + 1))}
                    disabled={!canUpgrade || isMaxed}
                    className={`px-4 py-2 rounded ${
                      isMaxed
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : canUpgrade
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isMaxed ? 'MAXED' : 'UPGRADE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
