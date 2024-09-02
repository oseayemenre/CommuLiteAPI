import z from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(1),
});
