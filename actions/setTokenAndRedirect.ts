"use server";

import { AUTH_TOKEN_KEY } from "@/lib/constant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SetTokenAndRedirectOption {
  redirect?: string;
}

const setTokenAndRedirect = async (
  token: string,
  option: SetTokenAndRedirectOption
) => {
  cookies().set(AUTH_TOKEN_KEY, token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  if (option && option.redirect) {
    redirect(option.redirect);
  }
};

export default setTokenAndRedirect;
