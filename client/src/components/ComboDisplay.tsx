
interface ComboDisplayProps {
  combo: number;
  multiplier: number;
  timeRemaining: number;
}

export default function ComboDisplay({ combo, multiplier, timeRemaining }: ComboDisplayProps) {
  if (combo < 2) return null;

  const percentage = (timeRemaining / 3) * 100;
  const isHighCombo = combo >= 20;
  const isMediumCombo = combo >= 10;

  return (
    <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40">
      <div className={`bg-black bg-opacity-80 rounded-lg p-4 border-2 ${
        isHighCombo ? 'border-yellow-400 animate-pulse' : 
        isMediumCombo ? 'border-orange-400' : 'border-blue-400'
      }`}>
        <div className="text-center">
          <div className="text-sm text-gray-400 uppercase">Combo</div>
          <div className={`text-5xl font-bold ${
            isHighCombo ? 'text-yellow-400' : 
            isMediumCombo ? 'text-orange-400' : 'text-blue-400'
          }`}>
            {combo}
          </div>
          <div className="text-lg text-white mt-1">
            {multiplier.toFixed(2)}x
          </div>
          
          <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                isHighCombo ? 'bg-yellow-400' : 
                isMediumCombo ? 'bg-orange-400' : 'bg-blue-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
