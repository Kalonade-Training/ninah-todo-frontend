import { z } from "zod";

export const TitleVO = z.string().min(1, "Required").max(50, "Title is too long");
export const BodyVO = z.string().max(1000, "Description is too long");
export type Title = z.infer<typeof TitleVO>;
export type Body = z.infer<typeof BodyVO>;

