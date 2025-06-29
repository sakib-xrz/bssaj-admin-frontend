import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

interface SetTokenPayload {
  token: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<SetTokenPayload>) => {
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;

export const useAuthToken = (): string | null => {
  return useSelector((state: RootState) => state.auth.token);
};

interface DecodedUser {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export const useCurrentUser = (): DecodedUser | null => {
  const token = useAuthToken();

  if (!token) return null;

  try {
    return jwtDecode<DecodedUser>(token);
  } catch {
    return null;
  }
};
