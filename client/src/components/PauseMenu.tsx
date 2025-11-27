
interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
}

export default function PauseMenu({ onResume, onRestart, onSettings }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-8">PAUSED</h2>
        
        <div className="space-y-4">
          <button
            onClick={onResume}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 text-lg"
          >
            Resume Game
          </button>
          
          <button
            onClick={onSettings}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200 text-lg"
          >
            Settings
          </button>
          
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 text-lg"
          >
            Restart Game
          </button>
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-6">
          Press ESC to resume
        </p>
      </div>
    </div>
  );
}
