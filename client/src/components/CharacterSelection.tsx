
import { useState } from "react";

export interface CharacterType {
  id: "sylph" | "assassin";
  name: string;
  description: string;
  weapon: string;
  stats: {
    speed: number;
    health: number;
    special: string;
  };
  color: string;
}

const CHARACTERS: CharacterType[] = [
  {
    id: "sylph",
    name: "🌸 Sylph Guardian",
    description: "A mystical guardian who communes with nature",
    weapon: "Sylph Blooms - Spawns magical flower turrets",
    stats: {
      speed: 200,
      health: 100,
      special: "Flower turrets that grow stronger over time"
    },
    color: "#e91e63"
  },
  {
    id: "assassin",
    name: "🕷️ Shadow Assassin",
    description: "A deadly hunter with mechanical companions",
    weapon: "Spider Swarm - Mechanical spiders hunt enemies",
    stats: {
      speed: 250,
      health: 80,
      special: "Fast movement, mechanical spider companions"
    },
    color: "#444444"
  }
];

interface CharacterSelectionProps {
  onSelect: (character: CharacterType) => void;
  onClose: () => void;
}

export default function CharacterSelection({ onSelect, onClose }: CharacterSelectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);

  const handleSelect = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 max-w-4xl w-full mx-4">
        <h2 className="text-4xl font-bold text-yellow-400 text-center mb-2">Choose Your Character</h2>
        <p className="text-white text-center mb-8">Select your playstyle and begin your survival journey</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CHARACTERS.map((character) => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character)}
              className={`bg-gray-800 border-2 rounded-lg p-6 transition-all duration-200 text-left group ${
                selectedCharacter?.id === character.id 
                  ? 'border-yellow-400 bg-gray-700' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded mr-4 shadow-lg flex items-center justify-center text-2xl"
                  style={{ 
                    backgroundColor: character.color,
                    boxShadow: `0 0 15px ${character.color}50`
                  }}
                >
                  {character.id === 'sylph' ? '🌸' : '🕷️'}
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400">
                  {character.name}
                </h3>
              </div>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                {character.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Speed:</span>
                  <span className="text-white">{character.stats.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health:</span>
                  <span className="text-white">{character.stats.health}</span>
                </div>
                <div className="mt-3">
                  <span className="text-gray-400">Weapon:</span>
                  <p className="text-white text-xs mt-1">{character.weapon}</p>
                </div>
                <div className="mt-3">
                  <span className="text-gray-400">Special:</span>
                  <p className="text-white text-xs mt-1">{character.stats.special}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSelect}
            disabled={!selectedCharacter}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
              selectedCharacter
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Game
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-lg font-bold text-lg bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200"
          >
            Back
          </button>
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-4">
          Click on a character to select, then press Start Game
        </p>
      </div>
    </div>
  );
}

export { CHARACTERS };
