import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
}

export function CasesPage({ cases, clients }: CasesPageProps) {
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
          <h1>Cases</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and filter all cases by status
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, case ID, title, type, or lawyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingCases.length})
          </TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 gap-4">
            {filteredCases.map((case_) => {
              const client = getClient(case_.clientId);
              return (
                <Card
                  key={case_.caseId}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Case Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3>{case_.caseTitle}</h3>
                            <Badge className={getStatusColor(case_.status)}>
                              {case_.status.charAt(0).toUpperCase() +
                                case_.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Case ID: {case_.caseId} | {case_.caseType}
                          </p>
                        </div>
                      </div>

                      {/* Case Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Client Name</p>
                          <p className="font-medium">{getClientFullName(case_.clientId)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Client ID</p>
                          <p className="font-medium">{case_.clientId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Lawyer Assigned</p>
                          <p className="font-medium">{case_.lawyerAssigned}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Creation Date</p>
                          <p className="font-medium">
                            {new Date(case_.creationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Client Contact Info */}
                      {client && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-4 border-t border-border">
                          <div>
                            <p className="text-muted-foreground mb-1">Client Email</p>
                            <p className="font-medium">{client.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Client Phone</p>
                            <p className="font-medium">{client.phoneNumber}</p>
                          </div>
                          {client.opposingParties && (
                            <div>
                              <p className="text-muted-foreground mb-1">
                                Opposing Party
                              </p>
                              <p className="font-medium">{client.opposingParties}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {case_.description && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-sm">{case_.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No cases found matching your criteria.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
