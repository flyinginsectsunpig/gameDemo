
import { useAudio } from "../lib/stores/useAudio";
import { useState } from "react";

interface SettingsMenuProps {
  onClose: () => void;
}

export default function SettingsMenu({ onClose }: SettingsMenuProps) {
  const { isMuted, toggleMute, backgroundMusic } = useAudio();
  const [musicVolume, setMusicVolume] = useState(backgroundMusic?.volume ?? 0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    if (backgroundMusic) {
      backgroundMusic.volume = volume;
    }
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSfxVolume(volume);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">Master Audio</span>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded ${
                  isMuted ? 'bg-red-600' : 'bg-green-600'
                } text-white font-bold`}
              >
                {isMuted ? 'Muted' : 'Unmuted'}
              </button>
            </label>
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              Music Volume: {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              SFX Volume: {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
