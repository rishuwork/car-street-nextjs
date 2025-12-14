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
import { CheckCircle2, Car, Maximize2 } from "lucide-react";

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
            // Filter ONLY "Sell You Car" requests locally (or could improve DB query)
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
            return notes;
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
        setIsDialogOpen(true);
    };

    const handleUpdateLead = async () => {
        if (!selectedLead) return;
        setIsUpdating(true);

        let notesToSave: string | null = notes.trim() || null;
        const vehicleData = getVehicleData(selectedLead.notes);

        if (vehicleData) {
            notesToSave = JSON.stringify({
                ...vehicleData,
                _adminNotes: notes.trim()
            });
        }

        const { error } = await supabase
            .from("contact_submissions")
            .update({
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
                                    {/* Vehicle Specs Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                                        <div><span className="font-semibold block">Odometer</span> {data?.odometer} KM</div>
                                        <div><span className="font-semibold block">Color</span> {data?.exteriorColor} / {data?.interiorColor}</div>
                                        <div><span className="font-semibold block">Transmission</span> {data?.transmission}</div>
                                        <div><span className="font-semibold block">Location</span> {data?.city}, {data?.province}</div>
                                    </div>

                                    {/* Condition Details */}
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

                                    {/* Images */}
                                    {data?.images && data.images.length > 0 && (
                                        <div>
                                            <p className="font-semibold text-sm mb-2">Photos ({data.images.length}):</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {data.images.map((url: string, idx: number) => (
                                                    <div key={idx} className="relative flex-none w-24 h-24 rounded-md overflow-hidden cursor-pointer border hover:border-primary" onClick={() => setSelectedImage(url)}>
                                                        <img src={url} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="flex gap-4 text-sm border-t pt-4">
                                        <div><span className="font-semibold">Email:</span> {lead.email}</div>
                                        <div><span className="font-semibold">Phone:</span> {lead.phone}</div>
                                    </div>

                                    {/* Actions */}
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
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label>Status</label>
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
                                                        <label>Admin Notes</label>
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

            {/* Image Preview Modal */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
                    {selectedImage && <img src={selectedImage} className="w-full h-auto max-h-[90vh] object-contain" />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
