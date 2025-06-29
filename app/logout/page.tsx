"use client";

import removeToken from "@/actions/removeToken";
import { logout } from "@/redux/features/auth/authSlice";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function Logout() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = async () => {
      dispatch(logout());
      await removeToken();
      window.location.href = "/";
    };

    handleLogout();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );
}
