import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Edit, Trash2, X } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { apiService } from "../services/api-service";
import { toast } from "sonner";

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

interface CasesPageProps {
  cases: Case[];
  clients: Client[];
  onCaseUpdate?: () => void;
}

export function CasesPage({ cases, clients, onCaseUpdate }: CasesPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "closed":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const getClient = (clientId: string) => {
    return clients.find((c) => c.clientId === clientId);
  };

  const getClientFullName = (clientId: string) => {
    const client = getClient(clientId);
    if (!client) return "Unknown Client";
    return `${client.firstName}${client.middleName ? " " + client.middleName : ""} ${client.lastName}`;
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    
    try {
      const result = await apiService.deleteCase(caseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Case deleted successfully');
        onCaseUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to delete case');
    }
  };

  const filteredCases = cases.filter((case_) => {
    const clientName = getClientFullName(case_.clientId).toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      clientName.includes(search) ||
      case_.caseId.toLowerCase().includes(search) ||
      case_.caseTitle.toLowerCase().includes(search) ||
      case_.caseType.toLowerCase().includes(search) ||
      case_.lawyerAssigned.toLowerCase().includes(search);

    const matchesTab = activeTab === "all" || case_.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const activeCases = cases.filter((c) => c.status === "active");
  const pendingCases = cases.filter((c) => c.status === "pending");
  const closedCases = cases.filter((c) => c.status === "closed");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Cases</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and track all legal cases
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search cases by client, case ID, title, type, or lawyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCases.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cases found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No cases match the selected filter"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCases.map((case_) => (
                <Card key={case_.caseId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{case_.caseTitle}</h3>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Case ID: {case_.caseId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Client: {getClientFullName(case_.clientId)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-case/${case_.caseId}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCase(case_.caseId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-muted-foreground">{case_.caseType}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lawyer:</span>
                        <p className="text-muted-foreground">{case_.lawyerAssigned}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">
                          {new Date(case_.creationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {case_.description && (
                      <div className="mt-4">
                        <span className="font-medium text-sm">Description:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {case_.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
