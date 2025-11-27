
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
    name: "Sylph Guardian",
    description: "A mystical guardian who communes with nature",
    weapon: "Sylph Blooms - Spawns magical flower turrets",
    stats: {
      speed: 200,
      health: 100,
      special: "Flower turrets that grow stronger over time"
    },
    color: "#7cb87c"
  },
  {
    id: "assassin",
    name: "Shadow Assassin",
    description: "A deadly hunter with mechanical companions",
    weapon: "Spider Swarm - Mechanical spiders hunt enemies",
    stats: {
      speed: 250,
      health: 80,
      special: "Fast movement, mechanical spider companions"
    },
    color: "#9b7cb8"
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel rounded-lg p-8 max-w-4xl w-full mx-4 relative z-10">
        <div className="gothic-divider mb-6" />
        
        <h2 className="gothic-title text-3xl font-bold text-center mb-2" style={{ color: '#c9a23f' }}>
          Choose Your Champion
        </h2>
        <p className="text-center mb-8" style={{ color: '#8b8b8b', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
          Select your playstyle and begin your survival journey
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CHARACTERS.map((character) => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character)}
              className={`gothic-panel rounded-lg p-6 transition-all duration-300 text-left group ${
                selectedCharacter?.id === character.id 
                  ? '' 
                  : ''
              }`}
              style={{ 
                borderColor: selectedCharacter?.id === character.id ? '#c9a23f' : '#2b193d',
                background: selectedCharacter?.id === character.id 
                  ? 'linear-gradient(180deg, rgba(43, 25, 61, 0.5) 0%, rgba(18, 9, 18, 0.8) 100%)'
                  : undefined
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded mr-4 flex items-center justify-center text-xl font-bold"
                  style={{ 
                    backgroundColor: character.color + '30',
                    border: `2px solid ${character.color}`,
                    color: character.color,
                    boxShadow: `0 0 15px ${character.color}30`
                  }}
                >
                  {character.id === 'sylph' ? '❀' : '◆'}
                </div>
                <h3 className="text-xl font-bold transition-colors" style={{ 
                  color: selectedCharacter?.id === character.id ? '#c9a23f' : '#d9d1c5',
                  fontFamily: 'Cinzel, serif'
                }}>
                  {character.name}
                </h3>
              </div>
              
              <p className="mb-4 leading-relaxed" style={{ color: '#8b8b8b', fontFamily: 'Crimson Text, serif' }}>
                {character.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#5c5c5c' }}>Speed:</span>
                  <span style={{ color: '#d9d1c5' }}>{character.stats.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#5c5c5c' }}>Health:</span>
                  <span style={{ color: '#d9d1c5' }}>{character.stats.health}</span>
                </div>
                <div className="mt-3">
                  <span style={{ color: '#5c5c5c' }}>Weapon:</span>
                  <p className="text-xs mt-1" style={{ color: character.color }}>{character.weapon}</p>
                </div>
                <div className="mt-3">
                  <span style={{ color: '#5c5c5c' }}>Special:</span>
                  <p className="text-xs mt-1" style={{ color: '#d9d1c5' }}>{character.stats.special}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="gothic-divider mb-6" />
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSelect}
            disabled={!selectedCharacter}
            className={`px-8 py-3 rounded-lg text-sm transition-all duration-200 ${
              selectedCharacter
                ? 'gothic-button gothic-button-primary'
                : ''
            }`}
            style={!selectedCharacter ? { 
              background: '#1b1a24', 
              border: '1px solid #2b193d', 
              color: '#5c5c5c',
              cursor: 'not-allowed',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            } : {}}
          >
            Begin Journey
          </button>
          <button
            onClick={onClose}
            className="gothic-button px-8 py-3 rounded-lg text-sm"
          >
            Back
          </button>
        </div>
        
        <p className="text-center text-xs mt-4" style={{ color: '#5c5c5c' }}>
          Click on a character to select, then press Begin Journey
        </p>
        
        <div className="gothic-divider mt-6" />
      </div>
    </div>
  );
}

export { CHARACTERS };
