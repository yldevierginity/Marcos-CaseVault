import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { apiService } from "../services/api-service";

export function EditCasePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cases/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCaseData(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch case");
      navigate('/cases');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedCase = {
      clientId: caseData.client,
      caseTitle: formData.get('caseTitle'),
      caseType: formData.get('caseType'),
      status: formData.get('status'),
      lawyerAssigned: formData.get('lawyerAssigned'),
      description: formData.get('description'),
    };

    try {
      await apiService.updateCase(id!, updatedCase);
      toast.success('Case updated successfully');
      navigate('/cases', { replace: true });
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update case');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/cases')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Case</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="caseTitle">Case Title <span className="text-red-500">*</span></Label>
              <Input id="caseTitle" name="caseTitle" defaultValue={caseData.case_title} required />
            </div>

            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Input id="caseType" name="caseType" defaultValue={caseData.case_type} />
            </div>

            <div>
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <select 
                id="status"
                name="status" 
                defaultValue={caseData.status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <Label htmlFor="lawyerAssigned">Lawyer Assigned</Label>
              <Input id="lawyerAssigned" name="lawyerAssigned" defaultValue={caseData.lawyer_assigned} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={caseData.description} rows={4} />
            </div>

            <Button type="submit" className="w-full">
              Update Case
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
