import { useState, useEffect } from "react";
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

type Page =
  | "login"
  | "forgot-password"
  | "reset-password"
  | "new-password"
  | "home"
  | "cases"
  | "about"
  | "lawyers"
  | "add-client";

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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [authState, setAuthState] = useState(authService.getCurrentState());
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [cases, setCases] = useState<Case[]>(initialCases);

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
      if (state.isAuthenticated && !state.isLoading) {
        setCurrentPage("home");
      } else if (!state.isAuthenticated && !state.isLoading) {
        setCurrentPage("login");
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    const currentState = authService.getCurrentState();
    if (currentState.isAuthenticated) {
      setCurrentPage("home");
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleForgotPassword = () => {
    setCurrentPage("forgot-password");
  };

  const handleResetPassword = () => {
    setCurrentPage("reset-password");
  };

  const handleNewPasswordRequired = () => {
    setCurrentPage("new-password");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
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
    setCurrentPage("home");
  };

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
    if (currentPage === "forgot-password") {
      return (
        <ForgotPasswordPage onBackToLogin={handleBackToLogin} />
      );
    }
    if (currentPage === "reset-password") {
      return (
        <ResetPasswordPage onBackToLogin={handleBackToLogin} />
      );
    }
    if (currentPage === "new-password") {
      return (
        <NewPasswordPage onSuccess={handleLogin} />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onNewPasswordRequired={handleNewPasswordRequired}
      />
    );
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentPage === "home" && (
        <Dashboard
          clients={clients}
          cases={cases}
          onNavigateToAddClient={() =>
            setCurrentPage("add-client")
          }
        />
      )}
      {currentPage === "cases" && (
        <CasesPage cases={cases} clients={clients} />
      )}
      {currentPage === "about" && <AboutPage />}
      {currentPage === "lawyers" && <LawyersPage />}
      {currentPage === "add-client" && (
        <AddClientPage
          onAddClient={handleAddClient}
          onBack={() => setCurrentPage("home")}
        />
      )}
      <Toaster />
    </Layout>
  );
}
