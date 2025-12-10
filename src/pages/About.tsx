import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Award, ThumbsUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import aboutImage from "@/assets/about-bg.jpg";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

const About = () => {
  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Customers" },
    { icon: Award, value: "15+", label: "Years in Business" },
    { icon: ThumbsUp, value: "98%", label: "Customer Satisfaction" },
    { icon: Clock, value: "24/7", label: "Customer Support" },
  ];

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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="About Us"
        description="Learn about Car Street - your trusted partner in finding quality pre-owned vehicles. Over 15 years serving the community with transparent pricing and exceptional service."
        url="https://carstreet.ca/about"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative h-72 flex items-center justify-center text-white bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${aboutImage})` }}
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">About Car Street</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Your trusted partner in finding quality pre-owned vehicles
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-4 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardContent className="pt-6 pb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading font-bold mb-4">Our Story</h2>
              <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2008, Car Street has been serving the Langton community for over 15 years. What started as a small family-owned dealership has grown into one of the region's most trusted names in quality pre-owned vehicles.
                </p>
                <p>
                  Our commitment to transparency, quality, and customer satisfaction has earned us thousands of loyal customers and numerous industry awards. We believe that buying a car should be an exciting and stress-free experience, which is why we've built our business on the principles of honesty, integrity, and exceptional service.
                </p>
                <p>
                  Every vehicle in our inventory undergoes a rigorous inspection process to ensure it meets our high standards. We stand behind every car we sell with comprehensive warranty options and ongoing support, because your satisfaction is our success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-4 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-heading font-bold mb-3">Transparency</h3>
                <p className="text-secondary-foreground/80 text-sm">
                  We believe in complete honesty about our vehicles, pricing, and processes. No hidden fees, no surprises.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-heading font-bold mb-3">Quality</h3>
                <p className="text-secondary-foreground/80 text-sm">
                  Every vehicle is thoroughly inspected and reconditioned to meet our stringent quality standards.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-heading font-bold mb-3">Service</h3>
                <p className="text-secondary-foreground/80 text-sm">
                  Our relationship with you doesn't end at the sale. We're here to support you throughout your ownership.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="py-4">
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

export default About;