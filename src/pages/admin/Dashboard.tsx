import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Car, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalLeads: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [vehiclesRes, leadsRes] = await Promise.all([
      supabase.from("vehicles").select("status", { count: "exact" }),
      supabase.from("contact_submissions").select("*", { count: "exact" }),
    ]);

    const available = vehiclesRes.data?.filter((v) => v.status === "available").length || 0;
    const sold = vehiclesRes.data?.filter((v) => v.status === "sold").length || 0;

    setStats({
      totalVehicles: vehiclesRes.count || 0,
      availableVehicles: available,
      soldVehicles: sold,
      totalLeads: leadsRes.count || 0,
    });
  };

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: Car,
      color: "text-blue-600",
    },
    {
      title: "Available",
      value: stats.availableVehicles,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Sold",
      value: stats.soldVehicles,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your dealership</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
