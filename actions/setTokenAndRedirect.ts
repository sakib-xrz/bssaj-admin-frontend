"use server";

import { AUTH_TOKEN_KEY } from "@/lib/constant";
import { cookies } from "next/headers";

const setTokenAndRedirect = async (token: string) => {
  cookies().set(AUTH_TOKEN_KEY, token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
};

export default setTokenAndRedirect;
