import { useState } from "react";
import { Search, UserPlus, Users, Briefcase } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

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

interface DashboardProps {
  clients: Client[];
  cases: Case[];
  onNavigateToAddClient: () => void;
}

export function Dashboard({ clients, cases, onNavigateToAddClient }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  const getClientCases = (clientId: string) => {
    return cases.filter((c) => c.clientId === clientId);
  };

  const getFullName = (client: Client) => {
    return `${client.firstName}${client.middleName ? " " + client.middleName : ""} ${client.lastName}`;
  };

  const filteredClients = clients.filter((client) => {
    const fullName = getFullName(client).toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.phoneNumber.includes(search) ||
      client.clientId.toLowerCase().includes(search)
    );
  });

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "active").length;
  const pendingCases = cases.filter((c) => c.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage clients and their associated cases
          </p>
        </div>
        <Button onClick={onNavigateToAddClient} className="bg-accent hover:bg-accent/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-accent">{activeCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Pending Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-secondary">{pendingCases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const clientCases = getClientCases(client.clientId);
          return (
            <Card key={client.clientId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Client Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-primary/10 rounded-full p-2">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3>{getFullName(client)}</h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {client.clientId}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {clientCases.length} {clientCases.length === 1 ? "Case" : "Cases"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{client.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{client.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Civil Status</p>
                        <p className="font-medium">{client.civilStatus}</p>
                      </div>
                      {client.address.city && (
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {client.address.city}
                            {client.address.state && `, ${client.address.state}`}
                          </p>
                        </div>
                      )}
                      {client.opposingParties && (
                        <div>
                          <p className="text-muted-foreground">Opposing Party</p>
                          <p className="font-medium">{client.opposingParties}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Date Added</p>
                        <p className="font-medium">
                          {new Date(client.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {client.notes && (
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1">{client.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Cases Info */}
                  {clientCases.length > 0 && (
                    <div className="lg:w-96 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <h4>Associated Cases</h4>
                      </div>
                      {clientCases.map((case_) => (
                        <Card key={case_.caseId} className="bg-muted/30">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{case_.caseTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                  {case_.caseType}
                                </p>
                              </div>
                              <Badge className={getStatusColor(case_.status)}>
                                {case_.status.charAt(0).toUpperCase() +
                                  case_.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-muted-foreground">
                                Lawyer: <span className="text-foreground">{case_.lawyerAssigned}</span>
                              </p>
                              <p className="text-muted-foreground">
                                Created: {new Date(case_.creationDate).toLocaleDateString()}
                              </p>
                            </div>
                            {case_.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {case_.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No clients found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
