import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, FileText } from "lucide-react";

type ContactSubmission = Tables<"contact_submissions">;

export default function LeadsManagement() {
  const [leads, setLeads] = useState<ContactSubmission[]>([]);

  interface PreApprovalData {
    vehicleType?: string;
    budget?: string;
    tradeIn?: string;
    creditRating?: string;
    employmentStatus?: string;
    incomeDetails?: {
      type?: string;
      annualIncome?: string;
      hourlyWage?: string;
      hoursPerWeek?: string;
      monthlyIncome?: string;
    };
    employerDetails?: {
      name?: string;
      jobTitle?: string;
      phone?: string;
      yearsEmployed?: string;
    };
    address?: string;
    timeAtAddress?: {
      years?: number;
      months?: number;
    };
    housing?: {
      rentOrOwn?: "rent" | "own";
      monthlyPayment?: string;
    };
    dateOfBirth?: string;
    age?: number;
    sin?: string;
  }
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ContactSubmission | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editingPreApprovalData, setEditingPreApprovalData] = useState<PreApprovalData | null>(null);

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
      // Filter OUT "Sell Your Car" requests to avoid duplication
      const generalLeads = (data || []).filter(lead =>
        !lead.message.startsWith("Sell Your Car Request:")
      );
      setLeads(generalLeads);
    }
    setIsLoading(false);
  };

  const getAdminNotes = (notes: string | null): string => {
    if (!notes) return "";
    // If notes is JSON (pre-approval data), check for embedded admin notes
    try {
      const parsed = JSON.parse(notes);
      return parsed._adminNotes || ""; // Return admin notes if they exist in JSON
    } catch {
      return notes; // It's regular admin notes
    }
  };

  const handleOpenDialog = (lead: ContactSubmission) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setNotes(getAdminNotes(lead.notes));
    setEditingPreApprovalData(parsePreApprovalData(lead.notes));
    setIsDialogOpen(true);
  };

  const hasAdminNotes = (lead: ContactSubmission): string | null => {
    return getAdminNotes(lead.notes) || null;
  };

  const handleViewDetails = (lead: ContactSubmission) => {
    setSelectedLead(lead);
    setViewDetailsOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    setIsUpdating(true);

    // Preserve pre-approval JSON data if it exists, store admin notes separately
    let notesToSave: string | null = notes.trim() || null;
    const existingPreApprovalData = parsePreApprovalData(selectedLead.notes);

    // If there was pre-approval data, we need to keep it and add admin notes in a structured way
    // If there was pre-approval data (or we are editing it), merge it
    if (existingPreApprovalData || editingPreApprovalData) {
      if (notes.trim() || editingPreApprovalData) {
        // Store both pre-approval data and admin notes as JSON
        notesToSave = JSON.stringify({
          ...(editingPreApprovalData || existingPreApprovalData),
          _adminNotes: notes.trim()
        });
      } else {
        // Keep original pre-approval data without admin notes
        notesToSave = selectedLead.notes;
      }
    }

    const { error } = await supabase
      .from("contact_submissions")
      .update({
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        status,
        notes: notesToSave,
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

  const parsePreApprovalData = (notes: string | null): PreApprovalData | null => {
    if (!notes) return null;
    try {
      return JSON.parse(notes);
    } catch {
      return null;
    }
  };

  const formatDob = (dob: string): string => {
    if (!dob || dob.length !== 8) return dob;
    return `${dob.slice(0, 2)}/${dob.slice(2, 4)}/${dob.slice(4, 8)}`;
  };

  const formatSin = (sin: string): string => {
    if (!sin || sin.length !== 9) return sin;
    return `${sin.slice(0, 3)}-${sin.slice(3, 5)}-${sin.slice(5, 9)}`;
  };

  const renderPreApprovalDetails = (data: PreApprovalData | null) => {
    if (!data) return null;

    return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Vehicle Type:</span>
            <p className="text-muted-foreground">{data.vehicleType || "N/A"}</p>
          </div>
          <div>
            <span className="font-semibold">Budget:</span>
            <p className="text-muted-foreground">{data.budget || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Trade-In:</span>
            <p className="text-muted-foreground">{data.tradeIn || "N/A"}</p>
          </div>
          <div>
            <span className="font-semibold">Credit Rating:</span>
            <p className="text-muted-foreground">{data.creditRating || "N/A"}</p>
          </div>
        </div>

        <div>
          <span className="font-semibold">Employment Status:</span>
          <p className="text-muted-foreground">{data.employmentStatus || "N/A"}</p>
        </div>

        {data.incomeDetails && (
          <div>
            <span className="font-semibold">Income Details:</span>
            <div className="ml-4 mt-1 space-y-1 text-muted-foreground">
              <p>Type: {data.incomeDetails.type || "N/A"}</p>
              {data.incomeDetails.annualIncome && (
                <p>Annual Income: ${parseInt(data.incomeDetails.annualIncome).toLocaleString()}</p>
              )}
              {data.incomeDetails.hourlyWage && (
                <p>Hourly Wage: ${parseInt(data.incomeDetails.hourlyWage).toLocaleString()} ({data.incomeDetails.hoursPerWeek}hrs/week)</p>
              )}
              {data.incomeDetails.monthlyIncome && (
                <p>Monthly Income: ${parseInt(data.incomeDetails.monthlyIncome).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {data.employerDetails && (
          <div>
            <span className="font-semibold">Employer Details:</span>
            <div className="ml-4 mt-1 space-y-1 text-muted-foreground">
              <p>Company: {data.employerDetails.name || "N/A"}</p>
              <p>Job Title: {data.employerDetails.jobTitle || "N/A"}</p>
              {data.employerDetails.phone && <p>Phone: {data.employerDetails.phone}</p>}
              {data.employerDetails.yearsEmployed && <p>Years Employed: {data.employerDetails.yearsEmployed}</p>}
            </div>
          </div>
        )}

        <div>
          <span className="font-semibold">Address:</span>
          <p className="text-muted-foreground">{data.address || "N/A"}</p>
        </div>

        {data.timeAtAddress && (
          <div>
            <span className="font-semibold">Time at Address:</span>
            <p className="text-muted-foreground">
              {data.timeAtAddress.years || 0} years, {data.timeAtAddress.months || 0} months
            </p>
          </div>
        )}

        {data.housing && (
          <div>
            <span className="font-semibold">Housing:</span>
            <div className="ml-4 mt-1 space-y-1 text-muted-foreground">
              <p>Status: {data.housing.rentOrOwn === "rent" ? "Renting" : "Owns"}</p>
              {data.housing.monthlyPayment && (
                <p>Monthly Payment: ${parseInt(data.housing.monthlyPayment).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Date of Birth:</span>
            <p className="text-muted-foreground">{formatDob(data.dateOfBirth) || "N/A"}</p>
          </div>
          <div>
            <span className="font-semibold">Age:</span>
            <p className="text-muted-foreground">{data.age || "N/A"}</p>
          </div>
        </div>

        {data.sin && (
          <div>
            <span className="font-semibold">SIN:</span>
            <p className="text-muted-foreground">{formatSin(data.sin)}</p>
          </div>
        )}
      </div>
    );
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
          {leads.map((lead) => {
            const preApprovalData = parsePreApprovalData(lead.notes);
            const isPreApproval = lead.message.includes("Pre-Approval Application");

            return (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{lead.name}</CardTitle>
                        {isPreApproval && (
                          <Badge variant="outline" className="bg-blue-50">Pre-Approval</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{lead.message}</p>
                  </div>

                  {hasAdminNotes(lead) && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <span className="font-medium text-sm">Your Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{hasAdminNotes(lead)}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    {preApprovalData && (
                      <Dialog open={viewDetailsOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                        setViewDetailsOpen(open);
                        if (!open) setSelectedLead(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleViewDetails(lead)} size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Full Application
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Pre-Approval Application Details</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="mb-4 pb-4 border-b">
                              <h3 className="font-semibold mb-2">Contact Information</h3>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-medium">Name:</span> {lead.name}</p>
                                <p><span className="font-medium">Email:</span> {lead.email}</p>
                                <p><span className="font-medium">Phone:</span> {lead.phone}</p>
                              </div>
                            </div>
                            {renderPreApprovalDetails(preApprovalData)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

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
                          <DialogTitle>Update Lead Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={selectedLead?.name || ""} onChange={(e) => setSelectedLead(prev => prev ? ({ ...prev, name: e.target.value }) : null)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input value={selectedLead?.email || ""} onChange={(e) => setSelectedLead(prev => prev ? ({ ...prev, email: e.target.value }) : null)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input value={selectedLead?.phone || ""} onChange={(e) => setSelectedLead(prev => prev ? ({ ...prev, phone: e.target.value }) : null)} />
                          </div>


                          {editingPreApprovalData && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                              <h3 className="font-semibold">Application Details</h3>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Vehicle Type</label>
                                  <Input value={editingPreApprovalData.vehicleType || ""} onChange={(e) => setEditingPreApprovalData({ ...editingPreApprovalData, vehicleType: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Budget</label>
                                  <Input value={editingPreApprovalData.budget || ""} onChange={(e) => setEditingPreApprovalData({ ...editingPreApprovalData, budget: e.target.value })} />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Employment Status</label>
                                <Select
                                  value={editingPreApprovalData.employmentStatus}
                                  onValueChange={(val) => setEditingPreApprovalData({ ...editingPreApprovalData, employmentStatus: val })}
                                >
                                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Employed">Employed</SelectItem>
                                    <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                                    <SelectItem value="Retired">Retired</SelectItem>
                                    <SelectItem value="Student">Student</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Employer</label>
                                  <Input
                                    value={editingPreApprovalData.employerDetails?.name || ""}
                                    onChange={(e) => setEditingPreApprovalData({
                                      ...editingPreApprovalData,
                                      employerDetails: { ...editingPreApprovalData.employerDetails, name: e.target.value }
                                    })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Job Title</label>
                                  <Input
                                    value={editingPreApprovalData.employerDetails?.jobTitle || ""}
                                    onChange={(e) => setEditingPreApprovalData({
                                      ...editingPreApprovalData,
                                      employerDetails: { ...editingPreApprovalData.employerDetails, jobTitle: e.target.value }
                                    })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Annual Income</label>
                                <Input
                                  value={editingPreApprovalData.incomeDetails?.annualIncome || ""}
                                  onChange={(e) => setEditingPreApprovalData({
                                    ...editingPreApprovalData,
                                    incomeDetails: { ...editingPreApprovalData.incomeDetails, annualIncome: e.target.value }
                                  })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Trade-In</label>
                                  <Select
                                    value={editingPreApprovalData.tradeIn}
                                    onValueChange={(val) => setEditingPreApprovalData({ ...editingPreApprovalData, tradeIn: val })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Yes">Yes</SelectItem>
                                      <SelectItem value="No">No</SelectItem>
                                      <SelectItem value="Unsure">Unsure</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Credit Rating</label>
                                  <Select
                                    value={editingPreApprovalData.creditRating}
                                    onValueChange={(val) => setEditingPreApprovalData({ ...editingPreApprovalData, creditRating: val })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="excellent">Excellent (760+)</SelectItem>
                                      <SelectItem value="very_good">Very Good (720-759)</SelectItem>
                                      <SelectItem value="good">Good (660-719)</SelectItem>
                                      <SelectItem value="fair">Fair (600-659)</SelectItem>
                                      <SelectItem value="poor">Poor (&lt;600)</SelectItem>
                                      <SelectItem value="unsure">Unsure</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Full Address</label>
                                <Input
                                  value={editingPreApprovalData.address || ""}
                                  onChange={(e) => setEditingPreApprovalData({ ...editingPreApprovalData, address: e.target.value })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Housing Status</label>
                                  <Select
                                    value={editingPreApprovalData.housing?.rentOrOwn}
                                    onValueChange={(val: "rent" | "own") => setEditingPreApprovalData({
                                      ...editingPreApprovalData,
                                      housing: { ...editingPreApprovalData.housing, rentOrOwn: val }
                                    })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="rent">Rent</SelectItem>
                                      <SelectItem value="own">Own</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Monthly Housing Payment</label>
                                  <Input
                                    value={editingPreApprovalData.housing?.monthlyPayment || ""}
                                    onChange={(e) => setEditingPreApprovalData({
                                      ...editingPreApprovalData,
                                      housing: { ...editingPreApprovalData.housing, monthlyPayment: e.target.value }
                                    })}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="border-t my-2"></div>

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
                            {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}