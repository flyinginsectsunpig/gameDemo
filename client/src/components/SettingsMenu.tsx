
import { useAudio } from "../lib/stores/useAudio";
import { useState } from "react";

interface SettingsMenuProps {
  onClose: () => void;
}

export default function SettingsMenu({ onClose }: SettingsMenuProps) {
  const { isMuted, toggleMute, musicVolume: globalMusicVolume, sfxVolume: globalSfxVolume, setMusicVolume: setGlobalMusicVolume, setSfxVolume: setGlobalSfxVolume } = useAudio();
  const [musicVolume, setMusicVolume] = useState(globalMusicVolume);
  const [sfxVolume, setSfxVolume] = useState(globalSfxVolume);

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    setGlobalMusicVolume(volume);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSfxVolume(volume);
    setGlobalSfxVolume(volume);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel p-8 rounded-lg max-w-md w-full mx-4 relative z-10">
        <div className="gothic-divider mb-6" />
        
        <h2 className="gothic-title text-3xl font-bold text-center mb-8" style={{ color: '#c9a23f' }}>
          SETTINGS
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-bold" style={{ color: '#d9d1c5', fontFamily: 'Cinzel, serif' }}>Master Audio</span>
            <button
              onClick={toggleMute}
              className="gothic-button px-4 py-2 rounded text-sm"
              style={{ borderColor: isMuted ? '#5c1f2a' : '#4a9060' }}
            >
              {isMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          <div>
            <label className="block font-bold mb-3" style={{ color: '#d9d1c5', fontFamily: 'Cinzel, serif' }}>
              Music Volume: <span style={{ color: '#c9a23f' }}>{Math.round(musicVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                background: `linear-gradient(to right, #8b2635 0%, #8b2635 ${musicVolume * 100}%, #1b1a24 ${musicVolume * 100}%, #1b1a24 100%)`,
                accentColor: '#c9a23f'
              }}
            />
          </div>

          <div>
            <label className="block font-bold mb-3" style={{ color: '#d9d1c5', fontFamily: 'Cinzel, serif' }}>
              SFX Volume: <span style={{ color: '#c9a23f' }}>{Math.round(sfxVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                background: `linear-gradient(to right, #8b2635 0%, #8b2635 ${sfxVolume * 100}%, #1b1a24 ${sfxVolume * 100}%, #1b1a24 100%)`,
                accentColor: '#c9a23f'
              }}
            />
          </div>

          <div className="gothic-divider my-6" />

          <button
            onClick={onClose}
            className="gothic-button gothic-button-primary w-full px-6 py-3 rounded-lg text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
