import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackFormStart, trackFormSubmit } from "@/utils/tracking";
import { z } from "zod";


interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });

  const handleFormFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart("contact");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
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

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "contact",
            data: {
              firstName: validatedData.name.split(" ")[0], // Simple split for template
              lastName: validatedData.name.split(" ").slice(1).join(" ") || "",
              email: validatedData.email,
              phone: validatedData.phone || "Not provided",
              message: validatedData.message
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send email notification", emailError);
      }

      // Track successful submission
      trackFormSubmit("contact");

      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      form.reset();
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
      <SEO
        title="Contact Us | Location, Hours & Phone Number | Car Street"
        description="Get in touch with Car Street. Visit our dealership in Langton, Ontario or call us to find your perfect pre-owned vehicle. Open 7 days a week."
        url="https://carstreet.ca/contact"
      />
      <Header />

      <main className="flex-1 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Contact Us</h1>
              <p className="text-lg text-muted-foreground">We're here to help you find your perfect vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="(519) 582-5555"
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
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visit Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Car Street</p>
                        <p className="text-muted-foreground">#1-17 Queen St</p>
                        <p className="text-muted-foreground">Langton, ON N0E 1G0</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href="tel:+16398990000" className="text-muted-foreground hover:text-primary transition-colors">
                          (639) 899-0000
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href="mailto:info@carstreet.ca" className="text-muted-foreground hover:text-primary transition-colors">
                          info@carstreet.ca
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2930.212481334369!2d-80.57972262393604!3d42.7415565109146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882dcc5a75843eb9%3A0xc9d01a458a320bf7!2s17%20Queen%20St%2C%20Langton%2C%20ON%20N0E%201G0%2C%20Canada!5e0!3m2!1sen!2sin!4v1764520396472!5m2!1sen!2sin"
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

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="py-12 mt-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-heading font-bold mb-3">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground">
                    Have questions about buying your car? We've got you covered.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Contact;