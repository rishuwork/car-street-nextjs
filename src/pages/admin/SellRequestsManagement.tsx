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
import { CheckCircle2, Car } from "lucide-react";

type ContactSubmission = Tables<"contact_submissions">;

export default function SellRequestsManagement() {
    const [leads, setLeads] = useState<ContactSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<ContactSubmission | null>(null);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingVehicleData, setEditingVehicleData] = useState<any>(null);

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
            toast.error("Failed to load requests");
        } else {
            const sellRequests = (data || []).filter(lead =>
                lead.message.startsWith("Sell Your Car Request:")
            );
            setLeads(sellRequests);
        }
        setIsLoading(false);
    };

    const getAdminNotes = (notes: string | null): string => {
        if (!notes) return "";
        try {
            const parsed = JSON.parse(notes);
            return parsed._adminNotes || "";
        } catch {
            return notes || "";
        }
    };

    const getVehicleData = (notes: string | null) => {
        if (!notes) return null;
        try {
            const parsed = JSON.parse(notes);
            return parsed;
        } catch {
            return null;
        }
    };

    const handleOpenDialog = (lead: ContactSubmission) => {
        setSelectedLead(lead);
        setStatus(lead.status);
        setNotes(getAdminNotes(lead.notes));
        setEditingVehicleData(getVehicleData(lead.notes) || {});
        setIsDialogOpen(true);
    };

    const handleUpdateLead = async () => {
        if (!selectedLead) return;
        setIsUpdating(true);

        let notesToSave: string | null = notes.trim() || null;

        // Merge edited vehicle data with admin notes
        if (editingVehicleData) {
            notesToSave = JSON.stringify({
                ...editingVehicleData,
                _adminNotes: notes.trim()
            });
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
            toast.error("Failed to update status");
        } else {
            toast.success("Request updated");
            setIsDialogOpen(false);
            loadLeads();
        }
        setIsUpdating(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "new": return "bg-blue-500";
            case "contacted": return "bg-yellow-500";
            case "converted": return "bg-green-500";
            case "processed": return "bg-purple-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-bold">Sell Your Car Requests</h1>
                <p className="text-muted-foreground">Manage incoming vehicle sell offers</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Loading requests...</div>
            ) : leads.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No sell requests found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {leads.map((lead) => {
                        const data = getVehicleData(lead.notes);
                        return (
                            <Card key={lead.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-xl flex items-center gap-2">
                                                    <Car className="h-5 w-5" />
                                                    {data?.year} {data?.make} {data?.model}
                                                </CardTitle>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Submitted {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })} by {lead.name}
                                            </p>
                                        </div>
                                        <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                                        <div><span className="font-semibold block">VIN</span> {data?.vin || "N/A"}</div>
                                        <div><span className="font-semibold block">Odometer</span> {data?.odometer} KM</div>
                                        <div><span className="font-semibold block">Color</span> {data?.exteriorColor} / {data?.interiorColor}</div>
                                        <div><span className="font-semibold block">Transmission</span> {data?.transmission}</div>
                                        <div><span className="font-semibold block">Location</span> {data?.city}, {data?.province}</div>
                                    </div>

                                    <div className="text-sm space-y-2">
                                        <p className="font-semibold">Condition Report:</p>
                                        <ul className="list-disc list-inside grid grid-cols-2 gap-x-4 text-muted-foreground">
                                            <li>Accidents: {data?.accidentClaims === "true" ? "Yes" : "No"}</li>
                                            <li>Smoke: {data?.smokedIn === "true" ? "Yes" : "No"}</li>
                                            <li>Ext Damage: {data?.exteriorDamage === "true" ? "Yes" : "No"}</li>
                                            <li>Int Damage: {data?.interiorDamage === "true" ? "Yes" : "No"}</li>
                                            <li>Windshield: {data?.windshieldCrack === "true" ? "Yes" : "No"}</li>
                                            <li>Keys: {data?.keys}</li>
                                        </ul>
                                    </div>

                                    {data?.images && data.images.length > 0 && (
                                        <div>
                                            <p className="font-semibold text-sm mb-2">Photos ({data.images.length}):</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {data.images.map((url: string, idx: number) => (
                                                    <div key={idx} className="relative flex-none w-24 h-24 rounded-md overflow-hidden cursor-pointer border hover:border-primary" onClick={() => setSelectedImage(url)}>
                                                        <img src={url} alt="Vehicle" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 text-sm border-t pt-4">
                                        <div><span className="font-semibold">Email:</span> {lead.email}</div>
                                        <div><span className="font-semibold">Phone:</span> {lead.phone}</div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                        <Dialog open={isDialogOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                                            setIsDialogOpen(open);
                                            if (!open) setSelectedLead(null);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button onClick={() => handleOpenDialog(lead)} size="sm">
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                                <DialogHeader><DialogTitle>Update Sell Request</DialogTitle></DialogHeader>
                                                <div className="space-y-4 py-4 px-1">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
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
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold mb-2">Vehicle Details</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">VIN</label>
                                                                <Input value={editingVehicleData?.vin || ""} onChange={(e) => setEditingVehicleData((prev: any) => ({ ...prev, vin: e.target.value }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Odometer</label>
                                                                <Input value={editingVehicleData?.odometer || ""} onChange={(e) => setEditingVehicleData((prev: any) => ({ ...prev, odometer: e.target.value }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Year</label>
                                                                <Input value={editingVehicleData?.year || ""} onChange={(e) => setEditingVehicleData((prev: any) => ({ ...prev, year: e.target.value }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Make</label>
                                                                <Input value={editingVehicleData?.make || ""} onChange={(e) => setEditingVehicleData((prev: any) => ({ ...prev, make: e.target.value }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Model</label>
                                                                <Input value={editingVehicleData?.model || ""} onChange={(e) => setEditingVehicleData((prev: any) => ({ ...prev, model: e.target.value }))} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t">
                                                        <label className="text-sm font-medium">Status</label>
                                                        <Select value={status} onValueChange={setStatus}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="new">New</SelectItem>
                                                                <SelectItem value="contacted">Contacted</SelectItem>
                                                                <SelectItem value="processed">Processed</SelectItem>
                                                                <SelectItem value="converted">Converted</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Admin Notes</label>
                                                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." rows={4} />
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

            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
                    {selectedImage && <img src={selectedImage} alt="Vehicle Preview" className="w-full h-auto max-h-[90vh] object-contain" />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
