import { useState } from "react";
import { PowerUpDefinition, POWERUP_DEFINITIONS } from "../lib/game/entities/PowerUp";

interface PowerUpSelectionProps {
  onSelect: (powerUp: PowerUpDefinition) => void;
  onClose: () => void;
}

export default function PowerUpSelection({ onSelect, onClose }: PowerUpSelectionProps) {
  const [selectedPowerUps] = useState(() => {
    // Randomly select 3 power-ups
    const shuffled = [...POWERUP_DEFINITIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const handleSelect = (powerUp: PowerUpDefinition) => {
    onSelect(powerUp);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold text-yellow-400 text-center mb-2">LEVEL UP!</h2>
        <p className="text-white text-center mb-6">Choose your upgrade:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedPowerUps.map((powerUp) => (
            <button
              key={powerUp.id}
              onClick={() => handleSelect(powerUp)}
              className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-yellow-400 rounded-lg p-4 transition-all duration-200 text-left group"
            >
              <div className="flex items-center mb-3">
                <div 
                  className="w-8 h-8 rounded mr-3 shadow-lg"
                  style={{ 
                    backgroundColor: powerUp.color,
                    boxShadow: `0 0 10px ${powerUp.color}50`
                  }}
                />
                <h3 className="text-xl font-bold text-white group-hover:text-yellow-400">
                  {powerUp.name}
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {powerUp.description}
              </p>
            </button>
          ))}
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-4">
          Click on an upgrade to select it
        </p>
      </div>
    </div>
  );
}