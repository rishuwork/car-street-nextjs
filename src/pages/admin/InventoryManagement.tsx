import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { ImageUpload, VehicleImages } from "@/components/admin/ImageUpload";

type Vehicle = Tables<"vehicles">;
type VehicleImage = Tables<"vehicle_images">;

export default function InventoryManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleImages, setVehicleImages] = useState<Record<string, VehicleImage[]>>({});
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    color: "",
    vin: "",
    transmission: "automatic",
    fuel_type: "gasoline",
    drivetrain: "fwd",
    description: "",
    status: "available" as "available" | "sold" | "pending",
    featured: false,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
      // Load images for all vehicles
      if (data) {
        const imagePromises = data.map(async (vehicle) => {
          const { data: images } = await supabase
            .from("vehicle_images")
            .select("*")
            .eq("vehicle_id", vehicle.id)
            .order("is_primary", { ascending: false });
          return { vehicleId: vehicle.id, images: images || [] };
        });
        const imageResults = await Promise.all(imagePromises);
        const imagesMap: Record<string, VehicleImage[]> = {};
        imageResults.forEach(({ vehicleId, images }) => {
          imagesMap[vehicleId] = images;
        });
        setVehicleImages(imagesMap);
      }
    }
    setIsLoading(false);
  };

  const loadVehicleImages = async (vehicleId: string) => {
    const { data } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("is_primary", { ascending: false });
    
    setVehicleImages(prev => ({
      ...prev,
      [vehicleId]: data || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData = {
      make: formData.make,
      model: formData.model,
      year: formData.year,
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage),
      color: formData.color,
      vin: formData.vin,
      transmission: formData.transmission,
      fuel_type: formData.fuel_type,
      drivetrain: formData.drivetrain,
      description: formData.description,
      status: formData.status,
      featured: formData.featured,
    };

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(vehicleData)
        .eq("id", editingVehicle.id);

      if (error) {
        toast.error("Failed to update vehicle");
      } else {
        toast.success("Vehicle updated successfully");
        setIsDialogOpen(false);
        setEditingVehicle(null);
        resetForm();
        loadVehicles();
      }
    } else {
      const { error } = await supabase.from("vehicles").insert(vehicleData);

      if (error) {
        toast.error("Failed to add vehicle");
      } else {
        toast.success("Vehicle added successfully");
        setIsDialogOpen(false);
        resetForm();
        loadVehicles();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      mileage: "",
      color: "",
      vin: "",
      transmission: "automatic",
      fuel_type: "gasoline",
      drivetrain: "fwd",
      description: "",
      status: "available",
      featured: false,
    });
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price.toString(),
      mileage: vehicle.mileage.toString(),
      color: vehicle.color,
      vin: vehicle.vin,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      drivetrain: vehicle.drivetrain,
      description: vehicle.description || "",
      status: vehicle.status,
      featured: vehicle.featured,
    });
    setIsDialogOpen(true);
  };

  const updateVehicleStatus = async (vehicleId: string, status: "available" | "sold" | "pending") => {
    const { error } = await supabase
      .from("vehicles")
      .update({ status })
      .eq("id", vehicleId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      loadVehicles();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your vehicle listings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingVehicle(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            </DialogHeader>
            
            {editingVehicle ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Vehicle Details</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>
                
                <TabsContent value="images" className="space-y-4">
                  <ImageUpload 
                    vehicleId={editingVehicle.id} 
                    onImagesUploaded={() => loadVehicleImages(editingVehicle.id)}
                  />
                  <VehicleImages
                    vehicleId={editingVehicle.id}
                    images={vehicleImages[editingVehicle.id] || []}
                    onImagesChanged={() => loadVehicleImages(editingVehicle.id)}
                  />
                </TabsContent>
                
                <TabsContent value="details">
                  <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    required
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN *</Label>
                  <Input
                    id="vin"
                    required
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuel_type">Fuel Type *</Label>
                  <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drivetrain">Drivetrain *</Label>
                  <Select value={formData.drivetrain} onValueChange={(value) => setFormData({ ...formData, drivetrain: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fwd">FWD</SelectItem>
                      <SelectItem value="rwd">RWD</SelectItem>
                      <SelectItem value="awd">AWD</SelectItem>
                      <SelectItem value="4wd">4WD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                  </Select>
                 </div>
               </div>
               <div>
                 <Label htmlFor="description">Description</Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   rows={4}
                 />
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="featured"
                   checked={formData.featured}
                   onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                 />
                 <Label htmlFor="featured" className="font-normal cursor-pointer">
                   Featured Vehicle (display on homepage)
                 </Label>
               </div>
               <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingVehicle(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                    <Button type="submit">{editingVehicle ? "Update" : "Add"} Vehicle</Button>
                  </div>
                </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      required
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color *</Label>
                    <Input
                      id="color"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vin">VIN *</Label>
                    <Input
                      id="vin"
                      required
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fuel_type">Fuel Type *</Label>
                    <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="drivetrain">Drivetrain *</Label>
                    <Select value={formData.drivetrain} onValueChange={(value) => setFormData({ ...formData, drivetrain: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fwd">FWD</SelectItem>
                        <SelectItem value="rwd">RWD</SelectItem>
                        <SelectItem value="awd">AWD</SelectItem>
                        <SelectItem value="4wd">4WD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                 </div>
                 <div>
                   <Label htmlFor="description">Description</Label>
                   <Textarea
                     id="description"
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     rows={4}
                   />
                 </div>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="featured-add"
                     checked={formData.featured}
                     onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                   />
                   <Label htmlFor="featured-add" className="font-normal cursor-pointer">
                     Featured Vehicle (display on homepage)
                   </Label>
                 </div>
                 <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Vehicle</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No vehicles in inventory yet.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Vehicle
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const images = vehicleImages[vehicle.id] || [];
            const primaryImage = images.find(img => img.is_primary) || images[0];
            
            return (
              <Card key={vehicle.id} className="overflow-hidden">
                {primaryImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={primaryImage.image_url}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={vehicle.status === "available" ? "default" : vehicle.status === "sold" ? "secondary" : "outline"}>
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p>Price: ${vehicle.price.toLocaleString()}</p>
                    <p>Mileage: {vehicle.mileage.toLocaleString()} km</p>
                    <p>VIN: {vehicle.vin}</p>
                  </div>
                  {!primaryImage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <ImageIcon className="h-4 w-4" />
                      <span>No images</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => openEditDialog(vehicle)}>
                      Edit
                    </Button>
                    <Select value={vehicle.status} onValueChange={(value: any) => updateVehicleStatus(vehicle.id, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                    </Select>
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
