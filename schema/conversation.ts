import { Role, Status } from "@prisma/client";
import z from "zod";

export const createGroupChatSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  members: z.string().array().min(1),
});

export const setGroupAdminSchema = z.object({
  member: z.string().min(1),
  role: z.nativeEnum(Role),
});

export const setGroupStatusSchema = z.object({
  status: z.nativeEnum(Status),
});
