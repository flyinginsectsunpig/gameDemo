import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-black overflow-hidden">
        <Game />
      </div>
    </QueryClientProvider>
  );
}

export default App;
