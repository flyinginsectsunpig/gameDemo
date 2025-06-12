import Game from './components/Game'
import { UndeadTileMapViewer } from './components/UndeadTileMapViewer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [queryClient] = useState(() => new QueryClient())
  const [currentView, setCurrentView] = useState<'game' | 'tilemap'>('game')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setCurrentView(currentView === 'game' ? 'tilemap' : 'game')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
          >
            {currentView === 'game' ? 'View Tilemap' : 'Back to Game'}
          </button>
        </div>

        <div className="w-full h-full">
          {currentView === 'game' ? <Game /> : <UndeadTileMapViewer />}
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App