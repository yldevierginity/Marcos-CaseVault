import { useState } from "react";
import { UserPlus, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
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

interface AddClientPageProps {
  onAddClient: (client: Client, cases: Omit<Case, "clientId">[]) => void;
  onBack: () => void;
}

const lawyers = [
  "Atty. Prince Arthur M. Neyra",
  "Atty. Cloydie Mark A. Marcos",
  "Atty. Ryan E. Mendez",
  "Atty. Deolanar C. Jungco",
];

const caseTypes = [
  "Contract Dispute",
  "Property Law",
  "Employment Law",
  "Estate Planning",
  "Personal Injury",
  "Business Formation",
  "Family Law",
  "Intellectual Property",
  "Criminal Defense",
  "Civil Litigation",
];

const civilStatuses = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
];

export function AddClientPage({ onAddClient, onBack }: AddClientPageProps) {
  const [clientData, setClientData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    civilStatus: "",
    phoneNumber: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    opposingParties: "",
    notes: "",
  });

  const [cases, setCases] = useState<Omit<Case, "clientId" | "caseId">[]>([
    {
      lawyerAssigned: "",
      caseTitle: "",
      caseType: "",
      status: "pending",
      description: "",
      creationDate: new Date().toISOString().split("T")[0],
    },
  ]);

  const addCase = () => {
    setCases([
      ...cases,
      {
        lawyerAssigned: "",
        caseTitle: "",
        caseType: "",
        status: "pending",
        description: "",
        creationDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const removeCase = (index: number) => {
    if (cases.length > 1) {
      setCases(cases.filter((_, i) => i !== index));
    } else {
      toast.error("Client must have at least one case");
    }
  };

  const updateCase = (
    index: number,
    field: keyof Omit<Case, "clientId" | "caseId">,
    value: string
  ) => {
    const updatedCases = [...cases];
    updatedCases[index] = { ...updatedCases[index], [field]: value };
    setCases(updatedCases);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate client data
    if (
      !clientData.firstName ||
      !clientData.lastName ||
      !clientData.dateOfBirth ||
      !clientData.civilStatus ||
      !clientData.phoneNumber ||
      !clientData.email
    ) {
      toast.error("Please fill in all required client fields");
      return;
    }

    // Validate cases
    for (let i = 0; i < cases.length; i++) {
      if (
        !cases[i].lawyerAssigned ||
        !cases[i].caseTitle ||
        !cases[i].caseType ||
        !cases[i].status
      ) {
        toast.error(`Please fill in all required fields for Case ${i + 1}`);
        return;
      }
    }

    const client: Client = {
      clientId: "", // Will be set by parent
      firstName: clientData.firstName,
      middleName: clientData.middleName,
      lastName: clientData.lastName,
      dateOfBirth: clientData.dateOfBirth,
      civilStatus: clientData.civilStatus,
      phoneNumber: clientData.phoneNumber,
      email: clientData.email,
      address: {
        street: clientData.street,
        city: clientData.city,
        state: clientData.state,
        zip: clientData.zip,
      },
      dateAdded: new Date().toISOString().split("T")[0],
      opposingParties: clientData.opposingParties,
      notes: clientData.notes,
    };

    onAddClient(client, cases);
    toast.success("Client and cases added successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button onClick={onBack} variant="ghost" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-3">
                <UserPlus className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>
                  Enter the client's personal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={clientData.firstName}
                  onChange={(e) =>
                    setClientData({ ...clientData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  placeholder="Michael"
                  value={clientData.middleName}
                  onChange={(e) =>
                    setClientData({ ...clientData, middleName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={clientData.lastName}
                  onChange={(e) =>
                    setClientData({ ...clientData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={clientData.dateOfBirth}
                  onChange={(e) =>
                    setClientData({ ...clientData, dateOfBirth: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="civilStatus">
                  Civil Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={clientData.civilStatus}
                  onValueChange={(value) =>
                    setClientData({ ...clientData, civilStatus: value })
                  }
                >
                  <SelectTrigger id="civilStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {civilStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+63 912 345 6789"
                  value={clientData.phoneNumber}
                  onChange={(e) =>
                    setClientData({ ...clientData, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={clientData.email}
                  onChange={(e) =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3>Address</h3>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  placeholder="Kimintang Street, Purok 4, Barangay Mintal"
                  value={clientData.street}
                  onChange={(e) =>
                    setClientData({ ...clientData, street: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Davao City"
                    value={clientData.city}
                    onChange={(e) =>
                      setClientData({ ...clientData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Davao Del Sur"
                    value={clientData.state}
                    onChange={(e) =>
                      setClientData({ ...clientData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="8000"
                    value={clientData.zip}
                    onChange={(e) =>
                      setClientData({ ...clientData, zip: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Opposing Parties */}
            <div className="space-y-2">
              <Label htmlFor="opposingParties">Opposing Party/Parties</Label>
              <Input
                id="opposingParties"
                placeholder="Enter opposing party names"
                value={clientData.opposingParties}
                onChange={(e) =>
                  setClientData({
                    ...clientData,
                    opposingParties: e.target.value,
                  })
                }
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the client..."
                rows={3}
                value={clientData.notes}
                onChange={(e) =>
                  setClientData({ ...clientData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Cases Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Cases</CardTitle>
                <CardDescription>
                  Add one or more cases for this client
                </CardDescription>
              </div>
              <Button type="button" onClick={addCase} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Case
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {cases.map((case_, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3>Case {index + 1}</h3>
                    {cases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCase(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Case Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Contract Dispute"
                        value={case_.caseTitle}
                        onChange={(e) =>
                          updateCase(index, "caseTitle", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Case Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={case_.caseType}
                        onValueChange={(value) =>
                          updateCase(index, "caseType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Lawyer Assigned <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={case_.lawyerAssigned}
                        onValueChange={(value) =>
                          updateCase(index, "lawyerAssigned", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lawyer" />
                        </SelectTrigger>
                        <SelectContent>
                          {lawyers.map((lawyer) => (
                            <SelectItem key={lawyer} value={lawyer}>
                              {lawyer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Status <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={case_.status}
                        onValueChange={(value) =>
                          updateCase(
                            index,
                            "status",
                            value as "active" | "pending" | "closed"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Case description..."
                      rows={3}
                      value={case_.description}
                      onChange={(e) =>
                        updateCase(index, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Client & Cases
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
