import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Progress } from "@/components/ui/progress";
import { ImageUploader } from "@/components/forms/ImageUploader";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import vinInfoImage from "@/assets/vin-info.png";

// Data Lists
const years = Array.from({ length: 2025 - 1986 + 1 }, (_, i) => 2025 - i);
const makes = [
    "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
    "Dodge", "Ford", "GMC", "Genesis", "Honda", "Hyundai", "INEOS", "Infiniti", "Jaguar",
    "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Lucid", "Maserati", "Mazda",
    "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche", "Ram",
    "Rivian", "Subaru", "Tesla", "Toyota", "VinFast", "Volkswagen", "Volvo"
];
const provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YK"];

const colors = [
    "Black", "Gray", "Silver", "White", "Blue",
    "Green", "Red", "Brown", "Gold", "Beige"
];

interface SellFormData {
    year: string;
    make: string;
    model: string;
    vin: string; // Added VIN
    city: string;
    province: string;
    odometer: string;
    exteriorColor: string;
    interiorColor: string;
    transmission: "Automatic" | "Manual" | "";
    exteriorDamage: string; // "true" or "false"
    interiorDamage: string;
    accidentClaims: string;
    smokedIn: string;
    windshieldCrack: string;
    keys: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    images: string[];
}

const steps = [
    { id: 1, title: "Vehicle Details" },
    { id: 2, title: "Specs & Condition" },
    { id: 3, title: "History" },
    { id: 4, title: "Photos" },
    { id: 5, title: "Personal Info" },
    { id: 6, title: "Contact" },
];

export default function SellYourCar() {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<SellFormData>({
        year: "", make: "", model: "", vin: "", city: "", province: "",
        odometer: "", exteriorColor: "", interiorColor: "", transmission: "",
        exteriorDamage: "", interiorDamage: "", accidentClaims: "", smokedIn: "",
        windshieldCrack: "", keys: "",
        firstName: "", lastName: "", email: "", phone: "",
        images: []
    });

    const updateField = (field: keyof SellFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 6));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.year || !formData.make || !formData.model || !formData.city || !formData.province) {
                    toast({ title: "Incomplete", description: "Please fill in all vehicle details.", variant: "destructive" });
                    return false;
                }
                // VIN is verified if entered, valid length check optional but good UX
                if (formData.vin && formData.vin.length < 17) {
                    toast({ title: "Invalid VIN", description: "VIN is usually 17 characters.", variant: "warning" });
                }
                return true;
            case 2:
                if (!formData.odometer || !formData.exteriorColor || !formData.interiorColor || !formData.transmission) {
                    toast({ title: "Incomplete", description: "Please complete the vehicle specs.", variant: "destructive" });
                    return false;
                }
                return true;
            case 3:
                if (!formData.exteriorDamage || !formData.interiorDamage || !formData.accidentClaims || !formData.smokedIn || !formData.windshieldCrack || !formData.keys) {
                    toast({ title: "Incomplete", description: "Please answer all condition questions.", variant: "destructive" });
                    return false;
                }
                return true;
            case 5: // Name
                if (!formData.firstName || !formData.lastName) {
                    toast({ title: "Required", description: "Please enter your name.", variant: "destructive" });
                    return false;
                }
                return true;
            case 6: // Contact - Handled by submit
                return true;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.phone) {
            toast({ title: "Required", description: "Contact info is missing.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("contact_submissions").insert({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                message: `Sell Your Car Request: ${formData.year} ${formData.make} ${formData.model}`,
                notes: JSON.stringify({
                    ...formData
                }),
                status: "new"
            });

            if (error) throw error;

            toast({ title: "Success!", description: "Your offer request has been sent." });
            // Redirect or show success state
            setCurrentStep(7); // Virtual success step
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <SEO title="Sell Your Car | Car Street" description="Get an instant offer for your vehicle." url="https://carstreet.ca/sell-your-car" />

            <main className="flex-1 py-12 px-4">
                <div className="max-w-xl mx-auto">
                    {currentStep <= 6 && (
                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Steps to complete: {currentStep} / 6</span>
                                <span>{Math.round((currentStep / 6) * 100)}%</span>
                            </div>
                            <Progress value={(currentStep / 6) * 100} className="h-2" />
                        </div>
                    )}

                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-center">Vehicle Details</h2>
                                <p className="text-center text-muted-foreground">Enter vehicle details to get an offer.</p>

                                <div className="space-y-2">
                                    <Label>Vehicle Identification Number (VIN)</Label>
                                    <Input
                                        placeholder="Enter your VIN"
                                        value={formData.vin}
                                        onChange={e => updateField("vin", e.target.value.toUpperCase())}
                                        maxLength={17}
                                    />
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="px-0 h-auto text-xs text-blue-600 underline">
                                                Where can I find my VIN?
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <img src={vinInfoImage} alt="VIN Location Guide" className="w-full rounded-md" />
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="border-t my-4"></div>

                                <Select value={formData.year} onValueChange={(v) => updateField("year", v)}>
                                    <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                    <SelectContent className="max-h-[200px]">{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                                </Select>

                                <Select value={formData.make} onValueChange={(v) => updateField("make", v)}>
                                    <SelectTrigger><SelectValue placeholder="Make" /></SelectTrigger>
                                    <SelectContent className="max-h-[200px]">{makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                </Select>

                                <Input placeholder="Model (e.g. Civic, F-150)" value={formData.model} onChange={e => updateField("model", e.target.value)} />

                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="City" value={formData.city} onChange={e => updateField("city", e.target.value)} />
                                    <Select value={formData.province} onValueChange={(v) => updateField("province", v)}>
                                        <SelectTrigger><SelectValue placeholder="Prov" /></SelectTrigger>
                                        <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={nextStep} className="w-full mt-4">Get My Offer</Button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">{formData.year} {formData.make} Details</h2>
                                <Input placeholder="Odometer Reading (KM)" type="number" value={formData.odometer} onChange={e => updateField("odometer", e.target.value)} />

                                <Select value={formData.exteriorColor} onValueChange={v => updateField("exteriorColor", v)}>
                                    <SelectTrigger><SelectValue placeholder="Exterior Colour" /></SelectTrigger>
                                    <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>

                                <Select value={formData.interiorColor} onValueChange={v => updateField("interiorColor", v)}>
                                    <SelectTrigger><SelectValue placeholder="Interior Colour" /></SelectTrigger>
                                    <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>

                                <div className="space-y-2">
                                    <Label>Transmission</Label>
                                    <div className="flex gap-2">
                                        {["Automatic", "Manual"].map(t => (
                                            <Button
                                                key={t}
                                                variant={formData.transmission === t ? "default" : "outline"}
                                                onClick={() => updateField("transmission", t)}
                                                className="flex-1"
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">History & Condition</h2>

                                {[
                                    { k: "exteriorDamage", q: "Any existing exterior damage?" },
                                    { k: "interiorDamage", q: "Any existing interior damage?" },
                                    { k: "accidentClaims", q: "Any accidents or claims?" },
                                    { k: "smokedIn", q: "Has it been smoked in?" },
                                    { k: "windshieldCrack", q: "Any windshield chips/cracks?" }
                                ].map(item => (
                                    <div key={item.k} className="space-y-2">
                                        <Label>{item.q}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={formData[item.k as keyof SellFormData] === "true" ? "default" : "outline"}
                                                onClick={() => updateField(item.k as keyof SellFormData, "true")}
                                                className="flex-1"
                                            >
                                                Yes
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={formData[item.k as keyof SellFormData] === "false" ? "default" : "outline"}
                                                onClick={() => updateField(item.k as keyof SellFormData, "false")}
                                                className="flex-1"
                                            >
                                                No
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <Label>How many key fobs?</Label>
                                    <div className="flex gap-1">
                                        {["None", "1 Key", "2+ Keys"].map(k => (
                                            <Button
                                                key={k}
                                                size="sm"
                                                variant={formData.keys === k ? "default" : "outline"}
                                                onClick={() => updateField("keys", k)}
                                                className="flex-1 text-xs"
                                            >
                                                {k}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Photos (Optional)</h2>
                                <p className="text-sm text-muted-foreground">Upload photos to get a more accurate offer.</p>

                                <ImageUploader
                                    existingImages={formData.images}
                                    onImagesChange={(urls) => updateField("images", urls)}
                                />

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep}>Skip / Continue</Button>
                                </div>
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">What is your name?</h2>
                                <Input placeholder="First Name" value={formData.firstName} onChange={e => updateField("firstName", e.target.value)} />
                                <Input placeholder="Last Name" value={formData.lastName} onChange={e => updateField("lastName", e.target.value)} />

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Your Offer Is Ready!</h2>
                                <p className="text-sm text-muted-foreground text-center">Please share your contact information so we can provide you with your offer.</p>

                                <Input placeholder="Email Address" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} />
                                <Input placeholder="Phone Number" type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} />

                                <p className="text-xs text-center text-muted-foreground">By clicking Submit, you agree to our Terms of Use.</p>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 7 && (
                            <div className="text-center space-y-4 py-8">
                                <div className="text-5xl">🎉</div>
                                <h2 className="text-2xl font-bold">Request Received!</h2>
                                <p className="text-muted-foreground">We are reviewing your vehicle details and will contact you shortly with an offer.</p>
                                <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
