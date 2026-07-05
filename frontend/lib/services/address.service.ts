import { apiFetch } from "@/lib/api-client";
import type { Address } from "@/types";

export const addressService = {
  list() {
    return apiFetch<Address[]>("/addresses");
  },
  create(payload: Omit<Address, "id" | "user_id">) {
    return apiFetch<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: number, payload: Omit<Address, "id" | "user_id">) {
    return apiFetch<Address>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(id: number) {
    return apiFetch<{ message: string }>(`/addresses/${id}`, { method: "DELETE" });
  },
};
