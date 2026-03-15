import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Car, Mail, Users, LogOut, Home, HelpCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Car, label: "Inventory", path: "/admin/inventory" },
    { icon: Mail, label: "Leads", path: "/admin/leads" },
    { icon: Car, label: "Sell Requests", path: "/admin/sell-requests" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: HelpCircle, label: "FAQs", path: "/admin/faqs" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <h1 className="text-2xl font-heading font-bold text-primary">Car Street</h1>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setIsMobileOpen(false)}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link to="/">
          <Button variant="outline" className="w-full justify-start text-sm md:text-base">
            <Home className="mr-2 h-4 w-4" />
            View Website
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-sm md:text-base" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b">
          <div>
            <h1 className="text-xl font-heading font-bold text-primary">Car Street</h1>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-card border-r flex-col">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
