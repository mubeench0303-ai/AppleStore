import { apiFetch } from "@/lib/api-client";
import type { Review } from "@/types";

export interface CreateReviewPayload {
  product_id: number;
  order_id: number;
  rating: number;
  comment: string;
}

export const reviewService = {
  create(payload: CreateReviewPayload) {
    return apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
