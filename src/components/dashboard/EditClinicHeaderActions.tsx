"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { unclaimClinic } from "@/app/actions/clinic-management";

interface EditClinicHeaderActionsProps {
  clinicId: string;
  clinicName: string;
}

export function EditClinicHeaderActions({
  clinicId,
  clinicName,
}: EditClinicHeaderActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnclaimDialogOpen, setIsUnclaimDialogOpen] = useState(false);
  const [isUnclaiming, setIsUnclaiming] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleOpenUnclaimDialog = () => {
    setIsMenuOpen(false);
    setIsUnclaimDialogOpen(true);
  };

  const handleUnclaim = async () => {
    setIsUnclaiming(true);
    try {
      const result = await unclaimClinic(clinicId);

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
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Kunne ikke fjerne ejerskab";
      toast({
        title: "Fejl",
        description: message,
        variant: "destructive",
      });
      setIsUnclaiming(false);
    }
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Flere handlinger"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <MoreHorizontal className="h-5 w-5 text-gray-600" />
        </Button>

        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Klinik handlinger"
            className="absolute right-0 z-30 mt-2 w-52 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          >
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleOpenUnclaimDialog}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Fjern ejerskab
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isUnclaimDialogOpen} onOpenChange={setIsUnclaimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern ejerskab af klinik?</DialogTitle>
            <DialogDescription>
              Er du sikker på, at du vil fjerne dit ejerskab af {clinicName}? Du
              vil miste adgangen til at redigere denne klinik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUnclaimDialogOpen(false)}
              disabled={isUnclaiming}
            >
              Annuller
            </Button>
            <Button
              type="button"
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
}
