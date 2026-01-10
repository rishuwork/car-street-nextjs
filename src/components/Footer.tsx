import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import ucdaLogo from "@/assets/ucda-logo.png";
import omvicLogo from "@/assets/omvic-logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold">
              CAR <span className="text-accent">STREET</span>
            </h3>
            <p className="text-sm text-secondary-foreground">
              Your trusted partner for quality pre-owned vehicles. We offer the best deals with transparent pricing and excellent customer service.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/inventory" className="text-sm hover:text-primary transition-colors">
                Inventory
              </Link>
              <Link to="/sell-your-car" className="text-sm hover:text-primary transition-colors">
                Sell Your Car
              </Link>
              <Link to="/pre-approval" className="text-sm hover:text-primary transition-colors">
                Get Pre-Approved
              </Link>
              <Link to="/about" className="text-sm hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/privacy-policy" className="text-sm hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">Business Hours</h4>
            <div className="space-y-2 text-sm text-secondary-foreground/80">
              <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p>Saturday: 9:00 AM - 6:00 PM</p>
              <p>Sunday: 10:00 AM - 5:00 PM</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <a href="tel:+16398990000" className="flex items-start gap-2 text-sm hover:text-primary transition-colors">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>(639) 899-0000</span>
              </a>
              <a href="mailto:info@carstreet.ca" className="flex items-start gap-2 text-sm hover:text-primary transition-colors">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>info@carstreet.ca</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-secondary-foreground/80">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>#1-17 Queen St<br />Langton, ON N0E 1G0</span>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">Members Of</h4>
            <div className="flex flex-col gap-4 items-start">
              <img src={ucdaLogo} alt="UCDA Member" className="h-12 w-[126px] object-contain bg-white rounded p-1" />
              <img src={omvicLogo} alt="OMVIC Registered" className="h-12 w-[126px] object-contain bg-white rounded p-1" />
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Car Street. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;