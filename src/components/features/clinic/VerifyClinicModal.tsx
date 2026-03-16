/**
 * VerifyClinicModal Component
 * Modal that explains the clinic verification and claiming process.
 * Shows users how to sign up and claim their clinic - completely free.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface VerifyClinicModalProps {
  children: React.ReactNode;
}

export const VerifyClinicModal = ({ children }: VerifyClinicModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Verificer og administrer din klinik
          </DialogTitle>
          <DialogDescription className="text-base pt-2 space-y-2">
            <span className="block">
              Tusindvis bruger FysFinder til at finde en fysioterapeut. Tag kontrol over din klinik og bliv fundet af nye patienter - helt gratis!
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Sådan gør du:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    <span className="font-semibold">Opret en bruger</span> - det tager kun et minut
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    <span className="font-semibold">Claim din klinik</span> - få fuld kontrol over indholdet
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm">
              Når du har verificeret din klinik kan du:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Redigere priser, specialer, åbeningstider og mere
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Tilføje billeder og præsentere dit team
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Holde dine kontaktoplysninger opdaterede
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <Button asChild className="w-full bg-logo-blue hover:bg-logo-blue/90" size="lg">
            <Link href="/auth/signup">Opret gratis bruger</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
