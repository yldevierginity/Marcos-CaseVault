import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, User, Clock, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { apiService } from "../services/api-service";

interface Hearing {
  hearing_id: number;
  case: number;
  case_title: string;
  client_name: string;
  hearing_date: string;
  hearing_type: string;
  location: string;
  judge_name: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled" | "postponed";
}

export function HearingsPage() {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      const data = await apiService.getHearings();
      setHearings(data);
    } catch (error) {
      toast.error("Failed to fetch hearings");
    }
  };

  const handleDeleteHearing = async (hearingId: number) => {
    if (!confirm("Are you sure you want to delete this hearing?")) return;
    try {
      await apiService.deleteHearing(hearingId);
      toast.success("Hearing deleted successfully");
      fetchHearings();
    } catch (error) {
      toast.error("Failed to delete hearing");
    }
  };

  const filteredHearings = hearings.filter(hearing =>
    hearing.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hearing.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hearing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hearing.judge_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "postponed": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hearings</h1>
        <Button onClick={() => navigate('/add-hearing')}>
          <Plus className="mr-2 h-4 w-4" /> Add Hearing
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search hearings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredHearings.map(hearing => (
          <Card key={hearing.hearing_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{hearing.case_title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Client: {hearing.client_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/edit-hearing/${hearing.hearing_id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteHearing(hearing.hearing_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{new Date(hearing.hearing_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{hearing.hearing_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{hearing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{hearing.judge_name}</span>
                </div>
              </div>
              {hearing.notes && (
                <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">{hearing.notes}</p>
              )}
              <div className="mt-3">
                <Badge className={getStatusColor(hearing.status)}>{hearing.status.toUpperCase()}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
