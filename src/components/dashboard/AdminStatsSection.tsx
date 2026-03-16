"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getClinicStats } from "@/app/actions/admin-stats";
import { Building2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export const AdminStatsSection = () => {
  const [stats, setStats] = useState({ verifiedCount: 0, premiumCount: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const statsResult = await getClinicStats();
        if (statsResult.error) {
          toast({
            title: "Fejl",
            description: statsResult.error,
            variant: "destructive",
          });
          return;
        }

        setStats({
          verifiedCount: statsResult.verifiedCount || 0,
          premiumCount: statsResult.premiumCount || 0,
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
        toast({
          title: "Fejl",
          description: "Der opstod en fejl ved indlæsning af statistik",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-gray-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-gray-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Verificerede klinikker
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verifiedCount}</div>
          <p className="text-xs text-muted-foreground mb-4">
            Totalt antal verificerede klinikker
          </p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/admin/clinics">Se klinikker</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Betalte abonnementer
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.premiumCount}</div>
          <p className="text-xs text-muted-foreground">
            Klinikker med aktivt premium abonnement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

