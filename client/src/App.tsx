import Game from './components/Game'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

function App() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
        <div className="w-full h-full">
          <Game />
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App