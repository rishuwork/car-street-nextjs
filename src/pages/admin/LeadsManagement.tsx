import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";

type ContactSubmission = Tables<"contact_submissions">;

export default function LeadsManagement() {
  const [leads, setLeads] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ContactSubmission | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load leads");
    } else {
      setLeads(data || []);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (lead: ContactSubmission) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setNotes(lead.notes || "");
    setIsDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from("contact_submissions")
      .update({
        status,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedLead.id);

    if (error) {
      toast.error("Failed to update lead");
    } else {
      toast.success("Lead updated successfully");
      setIsDialogOpen(false);
      loadLeads();
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "contacted":
        return "bg-yellow-500";
      case "converted":
        return "bg-green-500";
      case "processed":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Lead Management</h1>
        <p className="text-muted-foreground">Track and manage customer inquiries</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading leads...</div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{lead.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {lead.email}
                  </div>
                  {lead.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {lead.phone}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-sm">Message:</span>
                  <p className="text-sm text-muted-foreground mt-1">{lead.message}</p>
                </div>
                {lead.notes && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{lead.notes}</p>
                  </div>
                )}
                <div className="pt-4">
                  <Dialog open={isDialogOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedLead(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleOpenDialog(lead)} size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Update Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Lead Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="processed">Processed</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes / Comments</label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes or comments about this lead..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleUpdateLead} disabled={isUpdating} className="w-full">
                          {isUpdating ? "Updating..." : "Save Changes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
