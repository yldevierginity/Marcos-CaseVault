import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { Dashboard } from "./components/Dashboard";
import { CasesPage } from "./components/CasesPage";
import { AboutPage } from "./components/AboutPage";
import { LawyersPage } from "./components/LawyersPage";
import { AddClientPage } from "./components/AddClientPage";
import { Toaster } from "./components/ui/sonner";

type Page =
  | "login"
  | "forgot-password"
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
  {
    clientId: "CL-002",
    firstName: "Emily",
    middleName: "Rose",
    lastName: "Roberts",
    dateOfBirth: "1990-07-22",
    civilStatus: "Single",
    phoneNumber: "(555) 123-4502",
    email: "emily.roberts@email.com",
    address: {
      street: "456 Maple Avenue",
      city: "Brooklyn",
      state: "NY",
      zip: "11201",
    },
    dateAdded: "2025-02-05",
    opposingParties: "Smith Family Trust",
    notes: "Urgent case, needs quick resolution",
  },
  {
    clientId: "CL-003",
    firstName: "David",
    middleName: "",
    lastName: "Martinez",
    dateOfBirth: "1978-11-30",
    civilStatus: "Divorced",
    phoneNumber: "(555) 123-4503",
    email: "david.martinez@email.com",
    address: {
      street: "789 Pine Road",
      city: "Queens",
      state: "NY",
      zip: "11354",
    },
    dateAdded: "2025-02-15",
    opposingParties: "XYZ Industries",
    notes: "Former client, returning for new matter",
  },
  {
    clientId: "CL-004",
    firstName: "Lisa",
    middleName: "Ann",
    lastName: "Thompson",
    dateOfBirth: "1965-05-18",
    civilStatus: "Widowed",
    phoneNumber: "(555) 123-4504",
    email: "lisa.thompson@email.com",
    address: {
      street: "321 Elm Street",
      city: "Manhattan",
      state: "NY",
      zip: "10022",
    },
    dateAdded: "2024-12-20",
    opposingParties: "",
    notes: "Estate planning for multiple properties",
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
  {
    caseId: "CS-002",
    clientId: "CL-002",
    lawyerAssigned: "Michael Chen",
    caseTitle: "Property Settlement Agreement",
    caseType: "Property Law",
    status: "pending",
    description:
      "Negotiating property division with Smith Family Trust regarding inherited assets.",
    creationDate: "2025-02-08",
  },
  {
    caseId: "CS-003",
    clientId: "CL-003",
    lawyerAssigned: "Jennifer Lopez",
    caseTitle: "Employment Discrimination Case",
    caseType: "Employment Law",
    status: "active",
    description:
      "Client alleges wrongful termination and discrimination based on age.",
    creationDate: "2025-02-20",
  },
  {
    caseId: "CS-004",
    clientId: "CL-004",
    lawyerAssigned: "Robert Johnson",
    caseTitle: "Estate Planning & Will Creation",
    caseType: "Estate Planning",
    status: "closed",
    description:
      "Comprehensive estate planning including will, trust, and power of attorney documents.",
    creationDate: "2024-12-22",
  },
  {
    caseId: "CS-005",
    clientId: "CL-001",
    lawyerAssigned: "Sarah Mitchell",
    caseTitle: "Business Formation LLC",
    caseType: "Business Formation",
    status: "pending",
    description:
      "Setting up new LLC for client's consulting business.",
    creationDate: "2025-03-01",
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] =
    useState<Client[]>(initialClients);
  const [cases, setCases] = useState<Case[]>(initialCases);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleForgotPassword = () => {
    setCurrentPage("forgot-password");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  const handleAddClient = (
    client: Client,
    clientCases: Omit<Case, "clientId" | "caseId">[],
  ) => {
    // Generate new client ID
    const clientNum = clients.length + 1;
    const newClientId = `CL-${clientNum.toString().padStart(3, "0")}`;
    const newClient = { ...client, clientId: newClientId };

    // Generate new case IDs
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

  // Show login or forgot password page if not authenticated
  if (!isAuthenticated) {
    if (currentPage === "forgot-password") {
      return (
        <ForgotPasswordPage onBackToLogin={handleBackToLogin} />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  // Show main application with layout
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