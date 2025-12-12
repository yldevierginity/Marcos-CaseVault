import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { apiService } from "../services/api-service";

interface Case {
  case_id: number;
  case_title: string;
  client_name: string;
}

export function AddHearingPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [formData, setFormData] = useState({
    case_id: "",
    hearing_date: "",
    hearing_type: "",
    location: "",
    judge_name: "",
    notes: "",
    status: "scheduled"
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cases/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCases(data.map((c: any) => ({
        case_id: c.case_id,
        case_title: c.case_title,
        client_name: c.client_name
      })));
    } catch (error) {
      toast.error("Failed to fetch cases");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.case_id || !formData.hearing_date) {
      toast.error("Please select a case and hearing date");
      return;
    }

    try {
      await apiService.createHearing(formData);
      toast.success("Hearing added successfully");
      navigate('/hearings');
    } catch (error: any) {
      toast.error(error.message || "Failed to add hearing");
    }
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/hearings')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hearings
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Hearing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Case <span className="text-red-500">*</span></Label>
              <Select value={formData.case_id} onValueChange={(value) => setFormData({...formData, case_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map(c => (
                    <SelectItem key={c.case_id} value={c.case_id.toString()}>
                      {c.case_title} - {c.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Hearing Date & Time <span className="text-red-500">*</span></Label>
              <Input 
                type="datetime-local" 
                value={formData.hearing_date} 
                onChange={(e) => setFormData({...formData, hearing_date: e.target.value})} 
                required 
              />
            </div>

            <div>
              <Label>Hearing Type</Label>
              <Input 
                value={formData.hearing_type} 
                onChange={(e) => setFormData({...formData, hearing_type: e.target.value})} 
                placeholder="e.g., Preliminary, Trial, Motion" 
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                placeholder="Court location" 
              />
            </div>

            <div>
              <Label>Judge Name</Label>
              <Input 
                value={formData.judge_name} 
                onChange={(e) => setFormData({...formData, judge_name: e.target.value})} 
                placeholder="Presiding judge" 
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                placeholder="Additional notes" 
                rows={4} 
              />
            </div>

            <Button type="submit" className="w-full">
              Add Hearing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
