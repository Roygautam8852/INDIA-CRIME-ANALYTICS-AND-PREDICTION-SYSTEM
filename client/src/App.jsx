import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { FilterProvider } from "./context/FilterContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import StateAnalysis from "./pages/StateAnalysis";
import CrimeTrends from "./pages/CrimeTrends";
import WomenSafety from "./pages/WomenSafety";
import Prediction from "./pages/Prediction";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <BrowserRouter>
          <div className="flex min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-auto max-w-screen-2xl">
              <Routes>
                <Route path="/"        element={<Dashboard />} />
                <Route path="/states"  element={<StateAnalysis />} />
                <Route path="/trends"  element={<CrimeTrends />} />
                <Route path="/women"   element={<WomenSafety />} />
                <Route path="/predict" element={<Prediction />} />
              </Routes>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0a0a0a",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          />
        </BrowserRouter>
      </FilterProvider>
    </QueryClientProvider>
  );
}
