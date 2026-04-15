// Dashboard clinic card actions.
// Updated: wires upgrade CTA to the real premium checkout flow.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { unclaimClinic } from "@/app/actions/clinic-management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Rocket,
  Trash2,
} from "lucide-react";

interface ClinicCardProps {
  clinic: {
    clinics_id: string;
    klinikNavn: string;
    lokation: string | null;
    verified_klinik: boolean | null;
  };
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isUnclaimDialogOpen, setIsUnclaimDialogOpen] = useState(false);
  const [isUnclaiming, setIsUnclaiming] = useState(false);

  const handleUnclaim = async () => {
    setIsUnclaiming(true);
    try {
      const result = await unclaimClinic(clinic.clinics_id);
      
      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
        setIsUnclaiming(false);
        return;
      }

      toast({
        title: "Ejerskab fjernet",
        description: "Du har fjernet ejerskab af klinikken",
      });

      setIsUnclaimDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Fejl",
        description: error.message || "Kunne ikke fjerne ejerskab",
        variant: "destructive",
      });
      setIsUnclaiming(false);
    }
  };

  const handleUpgrade = () => {
    router.push(`/dashboard/clinic/${clinic.clinics_id}/premium`);
  };

  return (
    <>
      <div className="border rounded-lg p-6 bg-white space-y-4">
        {/* Clinic Name and Location */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {clinic.klinikNavn}
          </h3>
          {clinic.lokation && (
            <p className="text-sm text-gray-600">{clinic.lokation}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start"
          >
            <Link href={`/dashboard/clinic/${clinic.clinics_id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Rediger klinik
            </Link>
          </Button>

          <Button
            onClick={handleUpgrade}
            variant="default"
            className="w-full justify-start bg-green-600 hover:bg-green-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Opgrader til featured
          </Button>

          <Button
            onClick={() => setIsUnclaimDialogOpen(true)}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Fjern ejerskab
          </Button>
        </div>

      </div>

      {/* Unclaim Confirmation Dialog */}
      <Dialog open={isUnclaimDialogOpen} onOpenChange={setIsUnclaimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern ejerskab af klinik?</DialogTitle>
            <DialogDescription>
              Er du sikker på, at du vil fjerne dit ejerskab af {clinic.klinikNavn}? 
              Du vil miste adgangen til at redigere denne klinik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnclaimDialogOpen(false)}
              disabled={isUnclaiming}
            >
              Annuller
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnclaim}
              disabled={isUnclaiming}
            >
              {isUnclaiming ? "Fjerner..." : "Fjern ejerskab"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

