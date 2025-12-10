import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Car, Mail, Users, LogOut, Home, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Car, label: "Inventory", path: "/admin/inventory" },
    { icon: Mail, label: "Leads", path: "/admin/leads" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: HelpCircle, label: "FAQs", path: "/admin/faqs" },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-heading font-bold text-primary">Car Street</h1>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
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
              <Button variant="outline" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                View Website
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
