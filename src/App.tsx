import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { SearchPage } from "./pages/Search";
import { TechnicianProfilePage } from "./pages/TechnicianProfile";
import { ClassifiedsPage } from "./pages/Classifieds";
import { CreateProfilePage } from "./pages/CreateProfile";
import { NewClassifiedPage } from "./pages/NewClassified";
import { LoginPage } from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/tecnico/:id" element={<TechnicianProfilePage />} />
            <Route path="/classificados" element={<ClassifiedsPage />} />
            <Route path="/classificados/novo" element={<NewClassifiedPage />} />
            <Route path="/cadastro" element={<CreateProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <footer className="border-t border-line py-6 text-center text-xs font-mono text-steel">
          consertolivre — protótipo funcional, dados de demonstração
        </footer>
      </div>
    </BrowserRouter>
  );
}
