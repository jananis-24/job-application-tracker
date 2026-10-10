import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/layouts/AppLayout";

import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import Settings from "@/pages/Settings";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="job-tracker-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
