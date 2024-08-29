import { z } from "zod";

const countDigits = (str: string): number => {
  return (str.match(/\d/g) || []).length;
};

export const createAccountSchema = z.object({
  phone_no: z.string().refine((value) => countDigits(value) === 11),
});

export const verifyOTPSchema = z.object({
  otp: z.number(),
});
