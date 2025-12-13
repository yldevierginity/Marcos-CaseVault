import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { apiService } from "../services/api-service";

const civilStatuses = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
];

export function EditClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [civilStatus, setCivilStatus] = useState("");

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/clients/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setClient(data);
      setCivilStatus(data.civil_status || "");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch client");
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedClient = {
      firstName: formData.get('firstName'),
      middleName: formData.get('middleName'),
      lastName: formData.get('lastName'),
      dateOfBirth: formData.get('dateOfBirth'),
      civilStatus: civilStatus,
      phoneNumber: formData.get('phoneNumber'),
      email: formData.get('email'),
      address: {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
      },
      opposingParties: formData.get('opposingParties'),
      notes: formData.get('notes'),
    };

    try {
      await apiService.updateClient(id!, updatedClient);
      toast.success('Client updated successfully');
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update client');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" name="firstName" defaultValue={client.first_name} required />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" name="middleName" defaultValue={client.middle_name} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="lastName" name="lastName" defaultValue={client.last_name} required />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={client.date_of_birth} />
              </div>
              <div>
                <Label htmlFor="civilStatus">Civil Status</Label>
                <Select value={civilStatus} onValueChange={setCivilStatus}>
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
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" defaultValue={client.phone_number} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={client.email} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input id="street" name="street" defaultValue={client.street} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={client.city} />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" name="state" defaultValue={client.state} />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" name="zip" defaultValue={client.zip_code} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="opposingParties">Opposing Parties</Label>
              <Textarea id="opposingParties" name="opposingParties" defaultValue={client.opposing_parties} rows={3} />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={client.notes} rows={3} />
            </div>

            <Button type="submit" className="w-full">
              Update Client
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
