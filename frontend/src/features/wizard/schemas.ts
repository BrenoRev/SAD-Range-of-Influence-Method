import { z } from "zod";
import type { components } from "@/shared/types/api";

export const criterionKindSchema = z.enum(["benefit", "cost", "target"]);
export type CriterionKind = z.infer<typeof criterionKindSchema>;

export const criterionSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    kind: criterionKindSchema,
    A: z.number(),
    B: z.number(),
    C: z.number(),
    D: z.number(),
  })
  .refine((c) => c.A < c.B, { message: "Mín deve ser menor que Máx", path: ["A"] })
  .refine((c) => c.A <= c.C && c.C <= c.D && c.D <= c.B, {
    message: "Necessário A ≤ C ≤ D ≤ B",
  });

export type Criterion = components["schemas"]["Criterion"];

export const alternativesSchema = z
  .array(z.string().min(1, "Nome obrigatório"))
  .min(2, "Pelo menos 2 alternativas")
  .refine((arr) => {
    const cleaned = arr.map((a) => a.trim().toLowerCase()).filter(Boolean);
    return new Set(cleaned).size === cleaned.length;
  }, "Nomes devem ser únicos");

export const weightsSchema = z
  .array(z.number().min(0, "Peso não pode ser negativo"))
  .refine((arr) => arr.reduce((s, x) => s + x, 0) > 0, "Pelo menos um peso > 0");

export const matrixSchema = z.array(z.array(z.number()));
