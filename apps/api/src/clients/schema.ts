import { z } from "zod";
import { CLIENT_STATUSES } from "../domain/types.js";

const blankToNull = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value;
  });

const optionalEmail = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value.trim();
  })
  .refine((value) => value === undefined || value === null || z.string().email().safeParse(value).success, {
    message: "e-mail inválido",
  });

const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value;
  })
  .refine(
    (value) => value === undefined || value === null || !Number.isNaN(Date.parse(value)),
    { message: "data inválida" },
  );

export const clientStatusSchema = z.enum(CLIENT_STATUSES);

export const createClientSchema = z.object({
  name: z.string().trim().min(1),
  company: blankToNull,
  whatsapp: blankToNull,
  email: optionalEmail,
  ownerUserId: z.string().min(1),
  notes: blankToNull,
  status: z.literal("lead").optional(),
  lastContactAt: optionalDate,
  nextFollowUpAt: optionalDate,
  workspaceId: z.unknown().optional(),
  createdAt: z.unknown().optional(),
});

export const patchClientSchema = z.object({
  name: z.string().trim().min(1).optional(),
  company: blankToNull,
  whatsapp: blankToNull,
  email: optionalEmail,
  ownerUserId: z.string().min(1).optional(),
  notes: blankToNull,
  status: clientStatusSchema.optional(),
  lastContactAt: optionalDate,
  nextFollowUpAt: optionalDate,
  workspaceId: z.unknown().optional(),
  createdAt: z.unknown().optional(),
});

export function toDateOrNull(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}
