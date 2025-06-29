"use client";

import { persistor, store } from "@/redux/store";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { PersistGate } from "redux-persist/integration/react";
import { ReactNode } from "react";

interface GlobalProviderProps {
  children: ReactNode;
}

export default function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <Provider store={store}>
      <Toaster position="top-center" visibleToasts={1} richColors />
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
