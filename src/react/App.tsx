import { Route, Routes } from "react-router-dom";

import About from "./pages/About";
import Coloring from "./pages/Coloring";
import QuranBrowser from "./pages/QuranBrowser";
import RootsBrowser from "./pages/RootsBrowser";
import Translation from "./pages/Translation";
import YourNotes from "./pages/YourNotes";
import Tags from "./pages/Tags";
import Inspector from "./pages/Inspector";
import Comparator from "./pages/Comparator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<QuranBrowser />} />
      <Route path="/roots" element={<RootsBrowser />} />
      <Route path="/notes" element={<YourNotes />} />
      <Route path="/coloring" element={<Coloring />} />
      <Route path="/translation" element={<Translation />} />
      <Route path="/tags" element={<Tags />} />
      <Route path="/inspector" element={<Inspector />} />
      <Route path="/comparator" element={<Comparator />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<QuranBrowser />} />
    </Routes>
  );
}

export default App;
