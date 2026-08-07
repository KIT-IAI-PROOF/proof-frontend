import * as z from "zod";

export const HandleSchema = z.object({
    label: z.string().optional(),
    description: z.string().nullable().optional(),
    required: z.boolean().nullable().optional(),
    type: z.string().nullable().optional(),
    unit: z.string().nullable().optional(),
    defaultValue: z.string().nullable().optional(),
    startValue: z.string().nullable().optional(),
    communicationType: z.string().nullable().optional(),
    modelVarName: z.string().nullable().optional(),
    phase: z.string().nullable().optional(),
})

export type HandleType = z.infer<typeof HandleSchema>;
