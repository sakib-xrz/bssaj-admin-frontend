"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/redux/features/auth/authSlice";

export function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();

  return (
    <>
      <header className="flex items-center justify-between lg:justify-end p-6 bg-white border-b border-gray-200 h-16">
        <div className="flex items-center space-x-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setOpen(!open)}
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.profile_picture as string}
                    alt={user?.name}
                  />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      ?.map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/logout")}
                className="focus:bg-destructive focus:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
