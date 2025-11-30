import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        {/* Top bar */}
        <div className="border-b border-border py-2 hidden md:block">
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">
              Open 7 Days a Week | Quality Pre-Owned Vehicles
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+15555551234" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-medium">(555) 555-1234</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-foreground">
              CAR <span className="text-primary">STREET</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button variant="default" size="sm" asChild>
              <Link to="/inventory">View Inventory</Link>
            </Button>
          </nav>

          {/* Mobile navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button variant="default" size="lg" asChild className="mt-4">
                  <Link to="/inventory" onClick={() => setIsOpen(false)}>
                    View Inventory
                  </Link>
                </Button>
                <a
                  href="tel:+15555551234"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mt-4"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">(555) 555-1234</span>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
