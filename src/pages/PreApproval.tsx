import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Vehicle type images (placeholders - replace with actual images)
const vehicleTypes = [
  { id: "coupe", name: "Coupe", image: "🚗" },
  { id: "hatchback", name: "Hatchback", image: "🚙" },
  { id: "sedan", name: "Sedan", image: "🚘" },
  { id: "minivan", name: "Minivan", image: "🚐" },
  { id: "suv", name: "SUV & Crossover", image: "🚙" },
  { id: "truck", name: "Truck", image: "🚚" },
];

const budgetOptions = [
  "Under $400 / Month",
  "$400 - $499 / Month",
  "$500 - $600 / Month",
  "Over $600 / Month",
];

const tradeInOptions = ["Yes", "No", "Unsure"];

const creditRatingOptions = [
  { label: "Excellent (760–900)", value: "excellent" },
  { label: "Very Good (725–759)", value: "very-good" },
  { label: "Good (660–724)", value: "good" },
  { label: "Fair (600–659)", value: "fair" },
  { label: "Poor (300–599)", value: "poor" },
  { label: "No Credit / Unsure", value: "no-credit" },
];

const employmentOptions = [
  "Employed",
  "Self-Employed",
  "Student",
  "Retired / Pension",
  "Other",
];

const incomeTypeOptions = [
  "I know my annual salary",
  "I know my hourly wage",
  "I know my monthly income",
  "Other",
];

interface FormData {
  vehicleType: string;
  budget: string;
  tradeIn: string;
  creditRating: string;
  employmentStatus: string;
  incomeType: string;
  annualIncome: string;
  hourlyWage: string;
  hoursPerWeek: string;
  monthlyIncome: string;
  employerName: string;
  employerPhone: string;
  jobTitle: string;
  yearsEmployed: string;
  address: string;
  yearsAtAddress: string;
  monthsAtAddress: string;
  rentOrOwn: string;
  monthlyHousePayment: string;
  dob: string;
  age: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sin: string;
}

const TOTAL_STEPS = 13;
const STORAGE_KEY = "car_street_lead_v1";

const PreApproval = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    vehicleType: "",
    budget: "",
    tradeIn: "",
    creditRating: "",
    employmentStatus: "",
    incomeType: "",
    annualIncome: "",
    hourlyWage: "",
    hoursPerWeek: "",
    monthlyIncome: "",
    employerName: "",
    employerPhone: "",
    jobTitle: "",
    yearsEmployed: "",
    address: "",
    yearsAtAddress: "",
    monthsAtAddress: "",
    rentOrOwn: "",
    monthlyHousePayment: "",
    dob: "",
    age: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sin: "",
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 1);
      } catch (e) {
        console.error("Failed to load saved progress", e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-advance for selection steps
  const handleSelection = (field: keyof FormData, value: any) => {
    updateFormData(field, value);
    // Auto-advance after a short delay to show selection
    setTimeout(() => {
      if (validateStepField(field, value)) {
        setDirection(1);
        setCurrentStep(currentStep + 1);
      }
    }, 400);
  };

  const validateStepField = (field: keyof FormData, value: any): boolean => {
    return value !== "";
  };

  const goToStep = (step: number, dir: number) => {
    setDirection(dir);
    setCurrentStep(step);
    // Scroll to top of page smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const nextStep = () => {
    if (validateStep()) {
      goToStep(currentStep + 1, 1);
    }
  };

  const prevStep = () => {
    goToStep(currentStep - 1, -1);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.vehicleType) {
          toast({
            title: "Selection Required",
            description: "Please select a vehicle type",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (!formData.budget) {
          toast({
            title: "Selection Required",
            description: "Please select your budget",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        if (!formData.tradeIn) {
          toast({
            title: "Selection Required",
            description: "Please select if you have a trade-in",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 4:
        if (!formData.creditRating) {
          toast({
            title: "Selection Required",
            description: "Please select your credit rating",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 5:
        if (!formData.employmentStatus) {
          toast({
            title: "Selection Required",
            description: "Please select your employment status",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 6:
        if (!formData.incomeType) {
          toast({
            title: "Selection Required",
            description: "Please select how you know your income",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 7:
        if (formData.incomeType === "I know my annual salary" && !formData.annualIncome) {
          toast({
            title: "Input Required",
            description: "Please enter your annual income",
            variant: "destructive",
          });
          return false;
        }
        if (
          formData.incomeType === "I know my hourly wage" &&
          (!formData.hourlyWage || !formData.hoursPerWeek)
        ) {
          toast({
            title: "Input Required",
            description: "Please enter your hourly wage and hours per week",
            variant: "destructive",
          });
          return false;
        }
        if (
          (formData.incomeType === "I know my monthly income" || formData.incomeType === "Other") &&
          !formData.monthlyIncome
        ) {
          toast({
            title: "Input Required",
            description: "Please enter your monthly income",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 8:
        if (!formData.employerName || !formData.jobTitle) {
          toast({
            title: "Input Required",
            description: "Please enter your employer details",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 9:
        if (!formData.address) {
          toast({
            title: "Input Required",
            description: "Please enter your address",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 10:
        const years = parseInt(formData.yearsAtAddress) || 0;
        const months = parseInt(formData.monthsAtAddress) || 0;
        if (years === 0 && months === 0) {
          toast({
            title: "Input Required",
            description: "Please enter how long you've been at this address",
            variant: "destructive",
          });
          return false;
        }
        if (months > 11) {
          toast({
            title: "Invalid Input",
            description: "Months must be between 0 and 11",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 11:
        if (!formData.rentOrOwn || !formData.monthlyHousePayment) {
          toast({
            title: "Input Required",
            description: "Please complete all housing information",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 12:
        if (!formData.dob || !formData.age) {
          toast({
            title: "Input Required",
            description: "Please enter your date of birth",
            variant: "destructive",
          });
          return false;
        }
        if (formData.age < 17 || formData.age > 100) {
          toast({
            title: "Invalid Age",
            description: "You must be between 17 and 100 years old",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 13:
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.phone
        ) {
          toast({
            title: "Input Required",
            description: "Please complete all required fields",
            variant: "destructive",
          });
          return false;
        }
        if (!isValidEmail(formData.email)) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatCurrency = (value: string): string => {
    const num = value.replace(/\D/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

  const handleCurrencyInput = (
    field: keyof FormData,
    value: string
  ) => {
    const num = value.replace(/\D/g, "");
    updateFormData(field, num);
  };

  const calculateAge = (dob: string): number | null => {
    const cleaned = dob.replace(/\D/g, "");
    if (cleaned.length !== 8) return null;

    const day = parseInt(cleaned.substring(0, 2));
    const month = parseInt(cleaned.substring(2, 4));
    const year = parseInt(cleaned.substring(4, 8));

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDobChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    updateFormData("dob", cleaned);

    if (cleaned.length === 8) {
      const age = calculateAge(cleaned);
      updateFormData("age", age);
    } else {
      updateFormData("age", null);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleType: "",
      budget: "",
      tradeIn: "",
      creditRating: "",
      employmentStatus: "",
      incomeType: "",
      annualIncome: "",
      hourlyWage: "",
      hoursPerWeek: "",
      monthlyIncome: "",
      employerName: "",
      employerPhone: "",
      jobTitle: "",
      yearsEmployed: "",
      address: "",
      yearsAtAddress: "",
      monthsAtAddress: "",
      rentOrOwn: "",
      monthlyHousePayment: "",
      dob: "",
      age: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      sin: "",
    });
    setCurrentStep(1);
    setDirection(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      // Prepare detailed message with all form data
      const detailedInfo = {
        vehicleType: formData.vehicleType,
        budget: formData.budget,
        tradeIn: formData.tradeIn,
        creditRating: formData.creditRating,
        employmentStatus: formData.employmentStatus,
        incomeDetails: {
          type: formData.incomeType,
          annualIncome: formData.annualIncome,
          hourlyWage: formData.hourlyWage,
          hoursPerWeek: formData.hoursPerWeek,
          monthlyIncome: formData.monthlyIncome,
        },
        employerDetails: {
          name: formData.employerName,
          phone: formData.employerPhone,
          jobTitle: formData.jobTitle,
          yearsEmployed: formData.yearsEmployed,
        },
        address: formData.address,
        timeAtAddress: {
          years: formData.yearsAtAddress,
          months: formData.monthsAtAddress,
        },
        housing: {
          rentOrOwn: formData.rentOrOwn,
          monthlyPayment: formData.monthlyHousePayment,
        },
        dateOfBirth: formData.dob,
        age: formData.age,
        sin: formData.sin,
      };

      // Insert into contact_submissions table
      const { error } = await supabase.from("contact_submissions").insert({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        message: `Pre-Approval Application\n\nVehicle Type: ${formData.vehicleType}\nBudget: ${formData.budget}\nTrade-In: ${formData.tradeIn}\nCredit Rating: ${formData.creditRating}`,
        notes: JSON.stringify(detailedInfo, null, 2),
        status: "new",
      });

      if (error) throw error;

      setCurrentStep(14); // Success screen

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-[700px] mx-auto px-4">
          {/* Progress Bar */}
          {currentStep <= TOTAL_STEPS && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {TOTAL_STEPS}
                </span>
                <span className="text-sm text-muted-foreground">
                  Estimated time: {Math.max(1, TOTAL_STEPS - currentStep + 1)} min
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}

          {/* Form Steps */}
          <div className="bg-card rounded-lg shadow-lg p-8 min-h-[500px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                {/* Step 1: Vehicle Type */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      What type of vehicle are you interested in?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Select the vehicle type that best suits your needs
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicleTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelection("vehicleType", type.id)}
                          className={`p-6 rounded-lg border-2 transition-all ${
                            formData.vehicleType === type.id
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-5xl mb-3">{type.image}</div>
                          <div className="font-medium">{type.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Budget */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      What is your budget?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Select your preferred monthly payment range
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {budgetOptions.map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelection("budget", option)}
                          className={`p-5 rounded-lg border-2 text-center transition-all ${
                            formData.budget === option
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Trade-in */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Do you have a trade-in?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Let us know if you have a vehicle to trade in
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      {tradeInOptions.map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelection("tradeIn", option)}
                          className={`p-5 rounded-lg border-2 text-center transition-all ${
                            formData.tradeIn === option
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium text-lg">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Credit Rating */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Estimated credit rating
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      This helps us find the best financing options for you
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {creditRatingOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleSelection("creditRating", option.value)
                          }
                          className={`p-5 rounded-lg border-2 text-center transition-all ${
                            formData.creditRating === option.value
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">
                            {option.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Employment Status */}
                {currentStep === 5 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Employment Status
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      What is your current employment situation?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {employmentOptions.map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleSelection("employmentStatus", option)
                          }
                          className={`p-5 rounded-lg border-2 text-center transition-all ${
                            formData.employmentStatus === option
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Income Type Selection */}
                {currentStep === 6 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Income Details</h2>
                    <p className="text-muted-foreground mb-8">
                      How would you like to provide your income information?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {incomeTypeOptions.map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelection("incomeType", option)}
                          className={`p-5 rounded-lg border-2 text-center transition-all ${
                            formData.incomeType === option
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 7: Income Input */}
                {currentStep === 7 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Income Information</h2>
                    <p className="text-muted-foreground mb-8">
                      Please provide your income details
                    </p>

                    <div className="space-y-6">
                      {formData.incomeType === "I know my annual salary" && (
                        <div>
                          <Label htmlFor="annualIncome">
                            What is your annual income before taxes & deductions?
                          </Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="annualIncome"
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={formatCurrency(formData.annualIncome)}
                              onChange={(e) =>
                                handleCurrencyInput("annualIncome", e.target.value)
                              }
                              className="pl-7 text-lg"
                            />
                          </div>
                        </div>
                      )}

                      {formData.incomeType === "I know my hourly wage" && (
                        <>
                          <div>
                            <Label htmlFor="hourlyWage">
                              How much do you get paid per hour?
                            </Label>
                            <div className="relative mt-2">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                id="hourlyWage"
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={formatCurrency(formData.hourlyWage)}
                                onChange={(e) =>
                                  handleCurrencyInput("hourlyWage", e.target.value)
                                }
                                className="pl-7 text-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="hoursPerWeek">
                              Average hours per week
                            </Label>
                            <Input
                              id="hoursPerWeek"
                              type="text"
                              inputMode="numeric"
                              placeholder="40"
                              value={formData.hoursPerWeek}
                              onChange={(e) =>
                                updateFormData(
                                  "hoursPerWeek",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="mt-2 text-lg"
                            />
                          </div>
                        </>
                      )}

                      {(formData.incomeType === "I know my monthly income" ||
                        formData.incomeType === "Other") && (
                        <div>
                          <Label htmlFor="monthlyIncome">
                            What is your monthly income before taxes & deductions?
                          </Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="monthlyIncome"
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={formatCurrency(formData.monthlyIncome)}
                              onChange={(e) =>
                                handleCurrencyInput("monthlyIncome", e.target.value)
                              }
                              className="pl-7 text-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 8: Employer Details */}
                {currentStep === 8 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Employer Details</h2>
                    <p className="text-muted-foreground mb-8">
                      Please provide information about your current employer
                    </p>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="employerName">Employer Name *</Label>
                        <Input
                          id="employerName"
                          type="text"
                          placeholder="Company Name"
                          value={formData.employerName}
                          onChange={(e) =>
                            updateFormData("employerName", e.target.value)
                          }
                          className="mt-2 text-lg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input
                          id="jobTitle"
                          type="text"
                          placeholder="Your Position"
                          value={formData.jobTitle}
                          onChange={(e) =>
                            updateFormData("jobTitle", e.target.value)
                          }
                          className="mt-2 text-lg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="employerPhone">Employer Phone Number</Label>
                        <Input
                          id="employerPhone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.employerPhone}
                          onChange={(e) =>
                            updateFormData("employerPhone", e.target.value)
                          }
                          className="mt-2 text-lg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="yearsEmployed">Years at Current Employer</Label>
                        <Input
                          id="yearsEmployed"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formData.yearsEmployed}
                          onChange={(e) =>
                            updateFormData(
                              "yearsEmployed",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="mt-2 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 9: Address */}
                {currentStep === 9 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      What is your address?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      We need your address for verification purposes
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Start typing your address..."
                          value={formData.address}
                          onChange={(e) =>
                            updateFormData("address", e.target.value)
                          }
                          className="mt-2 text-lg"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: Address must be in Canada
                        </p>
                      </div>

                      {formData.address && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-muted rounded-lg"
                        >
                          <p className="text-sm font-medium mb-1">
                            Selected Address:
                          </p>
                          <p className="text-foreground">{formData.address}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 10: Years at Address */}
                {currentStep === 10 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      How long at this address?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Let us know how long you've lived at your current address
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="years">Years</Label>
                        <Input
                          id="years"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formData.yearsAtAddress}
                          onChange={(e) =>
                            updateFormData(
                              "yearsAtAddress",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="mt-2 text-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="months">Months</Label>
                        <Input
                          id="months"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formData.monthsAtAddress}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (parseInt(val) <= 11 || val === "") {
                              updateFormData("monthsAtAddress", val);
                            }
                          }}
                          className="mt-2 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 11: Rent or Own */}
                {currentStep === 11 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Do you Rent or Own?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Tell us about your housing situation
                    </p>

                    <div className="space-y-6">
                      <RadioGroup
                        value={formData.rentOrOwn}
                        onValueChange={(value) =>
                          updateFormData("rentOrOwn", value)
                        }
                      >
                        <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border">
                          <RadioGroupItem value="rent" id="rent" />
                          <Label htmlFor="rent" className="text-lg cursor-pointer">
                            Rent
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border">
                          <RadioGroupItem value="own" id="own" />
                          <Label htmlFor="own" className="text-lg cursor-pointer">
                            Own
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.rentOrOwn && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Label htmlFor="monthlyPayment">
                            Monthly {formData.rentOrOwn === "rent" ? "Rent" : "Mortgage"}{" "}
                            Payment
                          </Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="monthlyPayment"
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={formatCurrency(formData.monthlyHousePayment)}
                              onChange={(e) =>
                                handleCurrencyInput(
                                  "monthlyHousePayment",
                                  e.target.value
                                )
                              }
                              className="pl-7 text-lg"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 12: Date of Birth */}
                {currentStep === 12 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Date of Birth</h2>
                    <p className="text-muted-foreground mb-8">
                      Enter your date of birth (DDMMYYYY)
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="text"
                          inputMode="numeric"
                          placeholder="DDMMYYYY"
                          maxLength={8}
                          value={formData.dob}
                          onChange={(e) =>
                            handleDobChange(e.target.value.replace(/\D/g, ""))
                          }
                          className="mt-2 text-lg"
                        />
                      </div>

                      {formData.age !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg ${
                            formData.age >= 17 && formData.age <= 100
                              ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                              : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                          }`}
                        >
                          <p className="text-sm">
                            Based on your input, you are{" "}
                            <strong>{formData.age}</strong> years old.
                            {formData.age >= 17 && formData.age <= 100
                              ? " If this is correct, press continue."
                              : " Age must be between 17 and 100."}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 13: Final Details */}
                {currentStep === 13 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Almost Done!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Just a few more details to complete your application
                    </p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              updateFormData("firstName", e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              updateFormData("lastName", e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            updateFormData("email", e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            updateFormData("phone", e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sin">
                          Social Insurance Number (Optional)
                        </Label>
                        <Input
                          id="sin"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          placeholder="•••-••-••••"
                          value={formData.sin}
                          onChange={(e) =>
                            updateFormData(
                              "sin",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="mt-2"
                        />
                      </div>

                      <div className="p-4 bg-muted rounded-lg text-sm">
                        <p className="font-medium mb-2">Important Disclosure:</p>
                        <p className="text-muted-foreground leading-relaxed">
                          By submitting this application, you authorize Car Street
                          and its financing partners to obtain your credit report
                          and verify the information provided. This may result in a
                          credit inquiry that could affect your credit score. You
                          understand that submission does not guarantee approval and
                          that all information provided is subject to verification.
                          Car Street respects your privacy and will handle your
                          personal information in accordance with applicable privacy
                          laws.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Screen */}
                {currentStep === 14 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4">
                      Application Submitted!
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Thank you for your application. Our finance team will review
                      your information and contact you within 24 hours to discuss
                      your pre-approval options.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" variant="outline" onClick={resetForm}>
                        Submit Another Application
                      </Button>
                      <Button size="lg" asChild>
                        <a href="/">Return to Home</a>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep <= TOTAL_STEPS && (
              <motion.div
                className="flex justify-between mt-8 pt-6 border-t"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {/* Only show Continue button for input steps (7+) and Submit for final step */}
                {currentStep >= 7 && (
                  currentStep === TOTAL_STEPS ? (
                    <Button onClick={handleSubmit} size="lg">
                      Submit Application
                    </Button>
                  ) : (
                    <Button onClick={nextStep} size="lg">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreApproval;
