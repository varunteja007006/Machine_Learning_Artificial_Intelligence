import "./App.css";
import StreamResponse from "./reactQuery-axios";
import Streamer from "./Streamer";
import { QueryClient, QueryClientProvider } from "react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>Streaming API Response</h1>
      <Streamer />
    </QueryClientProvider>
  );
}

export default App;
