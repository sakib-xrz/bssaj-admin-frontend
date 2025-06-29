"use server";

import { AUTH_TOKEN_KEY } from "@/lib/constant";
import { cookies } from "next/headers";

const removeToken = async () => {
  cookies().delete(AUTH_TOKEN_KEY);
};

export default removeToken;
