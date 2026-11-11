import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sistema from "./pages/Sistema";
import EstruturaDados from "./pages/EstruturaDados";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sistema />} />

        <Route
          path="/estrutura-dados"
          element={<EstruturaDados />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;