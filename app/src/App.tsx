import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageShell } from "./layout/PageShell";
import { SessionProvider } from "./auth/SessionProvider";
import { RequireAuth } from "./auth/RequireAuth";
import { AssessmentSync } from "./auth/AssessmentSync";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { UploadPage } from "./pages/UploadPage";
import { ReviewPage } from "./pages/ReviewPage";
import { ExplainerPage } from "./pages/ExplainerPage";
import { GapCheckPage } from "./pages/GapCheckPage";
import { FreelancePage } from "./pages/FreelancePage";
import { ExportPage } from "./pages/ExportPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <SessionProvider>
      <AssessmentSync />
      <BrowserRouter>
        <PageShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/upload"
              element={
                <RequireAuth>
                  <UploadPage />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/review/:id"
              element={
                <RequireAuth>
                  <ReviewPage />
                </RequireAuth>
              }
            />
            <Route
              path="/assessment/:id"
              element={
                <RequireAuth>
                  <ExplainerPage />
                </RequireAuth>
              }
            />
            <Route
              path="/assessment/:id/gap-check"
              element={
                <RequireAuth>
                  <GapCheckPage />
                </RequireAuth>
              }
            />
            <Route
              path="/assessment/:id/freelance"
              element={
                <RequireAuth>
                  <FreelancePage />
                </RequireAuth>
              }
            />
            <Route
              path="/assessment/:id/export"
              element={
                <RequireAuth>
                  <ExportPage />
                </RequireAuth>
              }
            />
          </Routes>
        </PageShell>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
