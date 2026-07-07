"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { reviewService } from "@/lib/services/review.service";
import { APIError } from "@/lib/api-client";

interface OrderItemReviewFormProps {
  orderId: number;
  productId: number;
  productName: string;
  onSubmitted: () => void;
}

export default function OrderItemReviewForm({
  orderId,
  productId,
  productName,
  onSubmitted,
}: OrderItemReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a short review");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.create({
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Review submitted — thank you!");
      setOpen(false);
      setComment("");
      onSubmitted();
    } catch (err) {
      const message = err instanceof APIError ? err.message : "Couldn't submit review";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] text-accent font-medium hover:underline mt-2"
      >
        Write a review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-2xl border border-border bg-card">
      <p className="text-[13px] font-medium mb-3">Review {productName}</p>

      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            aria-label={`Rate ${i + 1} stars`}
            className="p-0.5"
          >
            <Star
              size={18}
              className={i < rating ? "fill-accent text-accent" : "text-border"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience with this product…"
        className="w-full border border-border rounded-xl px-3 py-2 text-[14px] focus-ring resize-none"
      />

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full px-4 py-2 text-[13px] font-medium"
        >
          {isSubmitting ? "Submitting…" : "Submit review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] text-muted hover:text-ink px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
