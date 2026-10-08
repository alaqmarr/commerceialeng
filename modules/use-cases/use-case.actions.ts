"use server";

/**
 * modules/use-cases/use-case.actions.ts
 * Server actions for managing Use Cases with cache revalidation.
 * Strictly under 200 lines.
 */

import { revalidatePath } from "next/cache";
import {
  getUseCasesQuery,
  getUseCaseBySlugOrIdQuery,
  createUseCaseQuery,
  updateUseCaseQuery,
  deleteUseCaseQuery,
} from "./queries";
import { validateUseCaseInput } from "./use-cases.lib";
import type {
  UseCaseDTO,
  CreateUseCaseInput,
  UpdateUseCaseInput,
  UseCaseActionResult,
} from "./use-cases.types";

export async function getUseCasesAction(): Promise<UseCaseDTO[]> {
  return getUseCasesQuery({ orderBy: "createdAt", orderDirection: "desc" });
}

export async function createUseCaseAction(
  input: CreateUseCaseInput
): Promise<UseCaseActionResult> {
  const validation = validateUseCaseInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error || "Invalid use-case data" };
  }

  try {
    const useCase = await createUseCaseQuery(input);
    revalidatePath("/use-cases");
    revalidatePath("/admin/use-cases");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, useCase };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create use case";
    return { success: false, error: msg };
  }
}

export async function updateUseCaseAction(
  id: string,
  input: UpdateUseCaseInput
): Promise<UseCaseActionResult> {
  try {
    const useCase = await updateUseCaseQuery(id, input);
    revalidatePath("/use-cases");
    revalidatePath(`/use-cases/${useCase.slug}`);
    revalidatePath("/admin/use-cases");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, useCase };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update use case";
    return { success: false, error: msg };
  }
}

export async function deleteUseCaseAction(
  id: string
): Promise<UseCaseActionResult> {
  try {
    const useCase = await deleteUseCaseQuery(id);
    revalidatePath("/use-cases");
    revalidatePath("/admin/use-cases");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, useCase };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete use case";
    return { success: false, error: msg };
  }
}
