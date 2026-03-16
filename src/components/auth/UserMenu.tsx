"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, ChevronDown } from "lucide-react";

type UserProfile = {
  full_name: string;
};

type UserMenuProps = {
  fullWidth?: boolean;
};

export const UserMenu = ({ fullWidth = false }: UserMenuProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);

          // Fetch profile
          const { data, error } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (error) {
            // Profile will be null, component will fall back to email
          } else if (data) {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching user in UserMenu:", error);
      }
    };

    fetchUser();

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Wait a moment for auth state to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    toast({
      title: "Logget ud",
      description: "Du er nu logget ud.",
    });
    
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <Button asChild variant="outline" className={`font-normal ${fullWidth ? "w-full" : ""}`}>
        <Link href="/auth/signin">Log ind</Link>
      </Button>
    );
  }

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${fullWidth ? "w-full justify-center border border-input" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">
          {profile?.full_name || user.email?.split("@")[0] || "Bruger"}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log ud</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

