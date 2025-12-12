import { useState } from "react";
import { Search, UserPlus, Users, Briefcase, Edit, Trash2, X, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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

interface DashboardProps {
  clients: Client[];
  cases: Case[];
  onNavigateToAddClient: () => void;
  onClientUpdate?: () => void;
  onCaseUpdate?: () => void;
}

export function Dashboard({ clients, cases, onNavigateToAddClient, onClientUpdate, onCaseUpdate }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addingCaseForClient, setAddingCaseForClient] = useState<Client | null>(null);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);

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

  const getFullName = (client: Client) => {
    return `${client.firstName}${client.middleName ? " " + client.middleName : ""} ${client.lastName}`;
  };

  const getClientCases = (clientId: string) => {
    return cases.filter((case_) => case_.clientId === clientId);
  };

  const handleAddCase = (client: Client) => {
    setAddingCaseForClient(client);
    setIsAddCaseDialogOpen(true);
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingCaseForClient) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const statusSelect = form.querySelector('select[name="status"]') as HTMLSelectElement;
    const status = statusSelect ? statusSelect.value : 'active';

    const newCase = {
      clientId: addingCaseForClient.clientId,
      caseTitle: formData.get('caseTitle') as string,
      caseType: formData.get('caseType') as string,
      status: status,
      description: formData.get('description') as string,
      lawyerAssigned: formData.get('lawyerAssigned') as string,
    };

    try {
      const result = await apiService.createCase(newCase);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Case added successfully');
        setIsAddCaseDialogOpen(false);
        setAddingCaseForClient(null);
        onCaseUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to add case');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedClient = {
      firstName: formData.get('firstName') as string,
      middleName: formData.get('middleName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      civilStatus: formData.get('civilStatus') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      address: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zip: formData.get('zip') as string,
      },
      opposingParties: formData.get('opposingParties') as string,
      notes: formData.get('notes') as string,
    };

    try {
      const result = await apiService.updateClient(editingClient.clientId, updatedClient);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Client updated successfully');
        setIsEditDialogOpen(false);
        setEditingClient(null);
        onClientUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This will also delete all associated cases.')) return;
    
    try {
      const result = await apiService.deleteClient(clientId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Client deleted successfully');
        onClientUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const filteredClients = clients.filter((client) => {
    const fullName = getFullName(client).toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.phoneNumber.includes(search) ||
      client.clientId.includes(search)
    );
  });

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "active").length;
  const pendingCases = cases.filter((c) => c.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of clients and cases
          </p>
        </div>
        <Button onClick={onNavigateToAddClient} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Client
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {clientCases.length} {clientCases.length === 1 ? "Case" : "Cases"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddCase(client)}
                          title="Add Case"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.clientId)}
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{client.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{client.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Civil Status</p>
                        <p className="font-medium">{client.civilStatus || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Street</p>
                        <p className="font-medium">{client.address.street || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">City</p>
                        <p className="font-medium">{client.address.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">State</p>
                        <p className="font-medium">{client.address.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ZIP Code</p>
                        <p className="font-medium">{client.address.zip || 'N/A'}</p>
                      </div>
                    </div>

                    {client.opposingParties && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm">Opposing Parties</p>
                        <p className="font-medium text-sm mt-1">{client.opposingParties}</p>
                      </div>
                    )}

                    {client.notes && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p className="font-medium text-sm mt-1">{client.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Cases */}
                  {clientCases.length > 0 && (
                    <div className="lg:w-80 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Recent Cases
                      </h4>
                      {clientCases.slice(0, 3).map((case_) => (
                        <div key={case_.caseId} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between mb-1 gap-3">
                            <p className="font-medium text-sm flex-1 pr-2">{case_.caseTitle}</p>
                            <Badge className={getStatusColor(case_.status)} variant="secondary">
                              {case_.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{case_.caseType}</p>
                        </div>
                      ))}
                      {clientCases.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{clientCases.length - 3} more cases
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Client Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Edit Client</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {editingClient && (
                <form onSubmit={handleUpdateClient} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={editingClient.firstName}
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleName" className="text-sm font-medium mb-2 block">Middle Name</Label>
                      <Input
                        id="middleName"
                        name="middleName"
                        defaultValue={editingClient.middleName}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">Surname</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={editingClient.lastName}
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium mb-2 block">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        defaultValue={editingClient.dateOfBirth}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="civilStatus" className="text-sm font-medium mb-2 block">Civil Status</Label>
                      <Input
                        id="civilStatus"
                        name="civilStatus"
                        defaultValue={editingClient.civilStatus}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium mb-2 block">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={editingClient.phoneNumber}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="street" className="text-sm font-medium mb-2 block">Street</Label>
                      <Input
                        id="street"
                        name="street"
                        defaultValue={editingClient.address.street}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium mb-2 block">City</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={editingClient.address.city}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium mb-2 block">State</Label>
                      <Input
                        id="state"
                        name="state"
                        defaultValue={editingClient.address.state}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-sm font-medium mb-2 block">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        defaultValue={editingClient.address.zip}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="opposingParties" className="text-sm font-medium mb-2 block">Opposing Party/Parties</Label>
                    <Textarea
                      id="opposingParties"
                      name="opposingParties"
                      defaultValue={editingClient.opposingParties}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={editingClient.notes}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button type="submit" className="flex-1 h-11">Update Client</Button>
                    <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Case Modal */}
      {isAddCaseDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Case for {addingCaseForClient?.firstName} {addingCaseForClient?.lastName}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCaseDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {addingCaseForClient && (
                <form onSubmit={handleCreateCase} className="space-y-4">
                  <div>
                    <Label htmlFor="caseTitle">Case Title</Label>
                    <Input
                      id="caseTitle"
                      name="caseTitle"
                      required
                      placeholder="Enter case title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="caseType">Case Type</Label>
                    <select 
                      name="caseType" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select case type</option>
                      <option value="Personal Injury">Personal Injury</option>
                      <option value="Criminal Defense">Criminal Defense</option>
                      <option value="Family Law">Family Law</option>
                      <option value="Corporate Law">Corporate Law</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Immigration">Immigration</option>
                      <option value="Employment Law">Employment Law</option>
                      <option value="Intellectual Property">Intellectual Property</option>
                      <option value="Tax Law">Tax Law</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select 
                      name="status" 
                      defaultValue="active"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lawyerAssigned">Lawyer Assigned</Label>
                    <select 
                      name="lawyerAssigned" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select lawyer</option>
                      <option value="Atty. Prince Arthur M. Neyra">Atty. Prince Arthur M. Neyra</option>
                      <option value="Atty. Cloydie Mark A. Marcos">Atty. Cloydie Mark A. Marcos</option>
                      <option value="Atty. Ryan E. Mendez">Atty. Ryan E. Mendez</option>
                      <option value="Atty. Deolanar C. Jungco">Atty. Deolanar C. Jungco</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter case description"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Add Case</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddCaseDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
