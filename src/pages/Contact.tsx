import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackFormStart, trackFormSubmit } from "@/utils/tracking";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  const handleFormFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart("contact");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const phoneValue = formData.get("phone") as string;
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: phoneValue?.trim() ? phoneValue : undefined,
        message: formData.get("message") as string,
      };

      // Validate input
      const validatedData = contactSchema.parse(data);

      // Submit to database
      const { error } = await supabase
        .from("contact_submissions")
        .insert([{
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          message: validatedData.message,
        }]);

      if (error) throw error;

      // Track successful submission
      trackFormSubmit("contact");

      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      e.currentTarget.reset();
      setFormStarted(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Please check your input", {
          description: error.errors[0].message,
        });
      } else {
        console.error("Error submitting form:", error);
        toast.error("Failed to send message", {
          description: "Please try again later or call us directly.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Contact Us</h1>
              <p className="text-xl text-muted-foreground">We're here to help you find your perfect vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                      <Input 
                        id="name" 
                        name="name"
                        placeholder="Your name" 
                        required 
                        onFocus={handleFormFocus}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="your@email.com" 
                        required 
                        onFocus={handleFormFocus}
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone</label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        placeholder="(555) 555-1234"
                        onFocus={handleFormFocus}
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                      <Textarea 
                        id="message" 
                        name="message"
                        placeholder="How can we help you?" 
                        rows={5}
                        required 
                        onFocus={handleFormFocus}
                        maxLength={1000}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visit Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Car Street</p>
                        <p className="text-muted-foreground">123 Auto Boulevard</p>
                        <p className="text-muted-foreground">Mississauga, ON L5B 1M5</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href="tel:+15555551234" className="text-muted-foreground hover:text-primary transition-colors">
                          (555) 555-1234
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href="mailto:info@carstreet.com" className="text-muted-foreground hover:text-primary transition-colors">
                          info@carstreet.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">Monday - Friday</p>
                          <p className="text-muted-foreground">9:00 AM - 8:00 PM</p>
                        </div>
                        <div>
                          <p className="font-medium">Saturday</p>
                          <p className="text-muted-foreground">9:00 AM - 6:00 PM</p>
                        </div>
                        <div>
                          <p className="font-medium">Sunday</p>
                          <p className="text-muted-foreground">10:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map */}
                <Card className="overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2885.5847892614243!2d-79.6437445!3d43.6777176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3ae8dddffc7f%3A0x5b2e2f7d1e6f8b1e!2sMississauga%2C%20ON%20L5B%201M5!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                    width="100%"
                    height="256"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Car Street Location"
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
