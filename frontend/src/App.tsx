import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { NewPasswordPage } from "./components/NewPasswordPage";
import { Dashboard } from "./components/Dashboard";
import { CasesPage } from "./components/CasesPage";
import { AboutPage } from "./components/AboutPage";
import { LawyersPage } from "./components/LawyersPage";
import { AddClientPage } from "./components/AddClientPage";
import { Toaster } from "./components/ui/sonner";
import { authService } from "./services/auth-service";

interface Case {
  caseId: string;
  clientId: string;
  lawyerAssigned: string;
  caseTitle: string;
  caseType: string;
  status: "active" | "pending" | "closed";
  description: string;
  creationDate: string;
}

interface Client {
  clientId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  civilStatus: string;
  phoneNumber: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dateAdded: string;
  opposingParties: string;
  notes: string;
}

const initialClients: Client[] = [
  {
    clientId: "CL-001",
    firstName: "John",
    middleName: "Michael",
    lastName: "Anderson",
    dateOfBirth: "1985-03-15",
    civilStatus: "Married",
    phoneNumber: "(555) 123-4501",
    email: "john.anderson@email.com",
    address: {
      street: "123 Oak Street",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    dateAdded: "2025-01-10",
    opposingParties: "ABC Corporation",
    notes: "Prefers morning appointments",
  },
];

const initialCases: Case[] = [
  {
    caseId: "CS-001",
    clientId: "CL-001",
    lawyerAssigned: "Sarah Mitchell",
    caseTitle: "Contract Dispute with ABC Corp",
    caseType: "Contract Dispute",
    status: "active",
    description:
      "Client disputes contract terms regarding intellectual property rights and payment schedule.",
    creationDate: "2025-01-15",
  },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(authService.getCurrentState());
  
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);
  
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(authService.getCurrentState());
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [cases, setCases] = useState<Case[]>(initialCases);

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
      if (!state.isAuthenticated && !state.isLoading) {
        navigate("/login", { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    await authService.signOut();
  };

  const handleAddClient = (
    client: Client,
    clientCases: Omit<Case, "clientId" | "caseId">[],
  ) => {
    const clientNum = clients.length + 1;
    const newClientId = `CL-${clientNum.toString().padStart(3, "0")}`;
    const newClient = { ...client, clientId: newClientId };

    const caseNum = cases.length + 1;
    const newCases = clientCases.map((case_, index) => ({
      ...case_,
      clientId: newClientId,
      caseId: `CS-${(caseNum + index).toString().padStart(3, "0")}`,
    }));

    setClients([...clients, newClient]);
    setCases([...cases, ...newCases]);
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={() => navigate("/")} onForgotPassword={() => navigate("/forgot-password")} onNewPasswordRequired={() => navigate("/new-password")} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage onBackToLogin={() => navigate("/login")} />} />
      <Route path="/reset-password" element={<ResetPasswordPage onBackToLogin={() => navigate("/login")} />} />
      <Route path="/new-password" element={<NewPasswordPage onSuccess={() => navigate("/")} />} />
      
      <Route path="/" element={<ProtectedRoute><Layout currentPage="home" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}><Dashboard clients={clients} cases={cases} onNavigateToAddClient={() => navigate("/add-client")} /><Toaster /></Layout></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Layout currentPage="cases" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}><CasesPage cases={cases} clients={clients} /><Toaster /></Layout></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><Layout currentPage="about" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}><AboutPage /><Toaster /></Layout></ProtectedRoute>} />
      <Route path="/lawyers" element={<ProtectedRoute><Layout currentPage="lawyers" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}><LawyersPage /><Toaster /></Layout></ProtectedRoute>} />
      <Route path="/add-client" element={<ProtectedRoute><Layout currentPage="add-client" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}><AddClientPage onAddClient={handleAddClient} onBack={() => navigate("/")} /><Toaster /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
