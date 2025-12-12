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
import { toast } from "sonner";
import { authService } from "./services/auth-service";
import { apiService } from "./services/api-service";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
      if (!state.isAuthenticated && !state.isLoading) {
        navigate("/login", { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      if (!authState.isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const [clientsResponse, casesResponse] = await Promise.all([
          apiService.getClients(1, 100),
          apiService.getCases(1, 100),
        ]);

        if (clientsResponse.error) {
          console.error('Clients error:', clientsResponse.error);
        } else if (clientsResponse.data) {
          setClients(clientsResponse.data.clients || []);
        }
        
        if (casesResponse.error) {
          console.error('Cases error:', casesResponse.error);
        } else if (casesResponse.data) {
          setCases(casesResponse.data.cases || []);
        }
      } catch (error: any) {
        console.error('Load data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authState.isAuthenticated]);

  const handleLogout = async () => {
    await authService.signOut();
  };

  const handleAddClient = async (
    client: Client,
    clientCases: Omit<Case, "clientId" | "caseId">[],
  ) => {
    try {
      // Create client in backend
      const clientResponse = await apiService.createClient({
        firstName: client.firstName,
        middleName: client.middleName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth,
        civilStatus: client.civilStatus,
        phoneNumber: client.phoneNumber,
        email: client.email,
        address: client.address,
        opposingParties: client.opposingParties,
        notes: client.notes,
      });

      if (clientResponse.error) {
        toast.error(clientResponse.error);
        return;
      }

      const newClient = clientResponse.data;

      // Create cases for the client
      const newCases: Case[] = [];
      for (const caseData of clientCases) {
        const caseResponse = await apiService.createCase({
          clientId: newClient.clientId,
          lawyerAssigned: caseData.lawyerAssigned,
          caseTitle: caseData.caseTitle,
          caseType: caseData.caseType,
          status: caseData.status,
          description: caseData.description,
        });

        if (caseResponse.error) {
          toast.error(`Failed to create case: ${caseResponse.error}`);
        } else {
          newCases.push(caseResponse.data);
        }
      }

      // Update local state
      setClients([...clients, newClient]);
      setCases([...cases, ...newCases]);
      
      toast.success("Client and cases added successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to add client");
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={() => navigate("/")} onForgotPassword={() => navigate("/forgot-password")} onNewPasswordRequired={() => navigate("/new-password")} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage onBackToLogin={() => navigate("/login")} />} />
      <Route path="/reset-password" element={<ResetPasswordPage onBackToLogin={() => navigate("/login")} />} />
      <Route path="/new-password" element={<NewPasswordPage onSuccess={() => navigate("/")} />} />
      
      <Route path="/" element={<ProtectedRoute><Layout currentPage="home" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}>{isLoading ? <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : <Dashboard clients={clients} cases={cases} onNavigateToAddClient={() => navigate("/add-client")} onClientUpdate={() => window.location.reload()} onCaseUpdate={() => window.location.reload()} />}<Toaster /></Layout></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Layout currentPage="cases" onNavigate={(page) => navigate(`/${page === "home" ? "" : page}`)} onLogout={handleLogout}>{isLoading ? <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : <CasesPage cases={cases} clients={clients} onCaseUpdate={() => window.location.reload()} />}<Toaster /></Layout></ProtectedRoute>} />
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
