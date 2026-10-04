"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-state";
import { supabase } from "@/lib/supabase";

type ModelReview = {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  review: string;
  created_at: string;
};

export function ModelReviews({ modelId, modelName }: { modelId: string; modelName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAuthReady, user } = useAuthState();
  const [reviews, setReviews] = useState<ModelReview[]>([]);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    await Promise.resolve();
    if (!supabase) {
      setError("Reviews are unavailable because Supabase is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: loadError } = await supabase
        .from("model_reviews")
        .select("id,user_id,display_name,rating,review,created_at")
        .eq("model_id", modelId)
        .order("created_at", { ascending: false });
      if (loadError) throw new Error(`Could not load reviews: ${loadError.message}`);

      setReviews((data ?? []) as ModelReview[]);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    void Promise.resolve().then(loadReviews);
  }, [loadReviews]);

  const ownReview = reviews.find((item) => item.user_id === user?.id);
  const averageRating = reviews.length
    ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
    : 0;

  function startReview() {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname || "/brands")}`);
      return;
    }
    setRating(ownReview?.rating ?? 5);
    setReview(ownReview?.review ?? "");
    setMessage("");
    setError("");
    setIsFormOpen(true);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!supabase) {
      setError("Reviews are unavailable because Supabase is not configured.");
      return;
    }
    if (!user?.id) {
      setError("Sign in to submit a review.");
      return;
    }

    const trimmedReview = review.trim();
    if (trimmedReview.length < 10 || trimmedReview.length > 1500) {
      setError("Write between 10 and 1,500 characters about your experience.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!sessionData.session?.user || sessionData.session.user.id !== user.id) {
        throw new Error("Your sign-in session expired. Sign in again to submit a review.");
      }

      const { error: saveError } = await supabase.from("model_reviews").upsert({
        model_id: modelId,
        user_id: sessionData.session.user.id,
        display_name: user.name.trim().slice(0, 80) || "Customer",
        rating,
        review: trimmedReview,
        updated_at: new Date().toISOString(),
      }, { onConflict: "model_id,user_id" });
      if (saveError) throw new Error(`Could not save your review: ${saveError.message}`);

      setMessage("Your review has been saved.");
      setIsFormOpen(false);
      await loadReviews();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="model-reviews">
      <div className="model-reviews-summary">
        <div>
          {isLoading ? <p className="model-reviews-rating">Loading reviews…</p> : reviews.length
            ? <p className="model-reviews-rating"><span aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>★ {averageRating.toFixed(1)}</span><span>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span></p>
            : <p className="model-reviews-rating">Be the first to review {modelName}.</p>}
          <p className="model-reviews-note">Share your experience with this model.</p>
        </div>
        <button type="button" className="model-review-button" onClick={startReview} disabled={!isAuthReady || isLoading || !supabase}>
          {ownReview ? "Update your review" : "Write a review"}
        </button>
      </div>

      {message ? <p className="model-review-message" role="status">{message}</p> : null}
      {error ? <p className="model-review-error" role="alert">{error}</p> : null}

      {isFormOpen ? <form className="model-review-form" onSubmit={submitReview}>
        <h3>{ownReview ? "Update your review" : `Review ${modelName}`}</h3>
        <fieldset>
          <legend>Your rating</legend>
          <div className="model-review-rating-picker">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={rating === value} className={value <= rating ? "is-selected" : ""}>★</button>)}
          </div>
        </fieldset>
        <label>
          Your review
          <textarea value={review} onChange={(event) => setReview(event.target.value.slice(0, 1500))} minLength={10} maxLength={1500} rows={5} required placeholder="What did you think of this model?" />
        </label>
        <div className="model-review-form-actions">
          <span>{review.trim().length}/1,500</span>
          <button type="button" className="model-review-cancel" onClick={() => setIsFormOpen(false)}>Cancel</button>
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : ownReview ? "Update review" : "Submit review"}</button>
        </div>
      </form> : null}

      {!isLoading && reviews.length ? <div className="model-review-list">
        {reviews.map((item) => <article key={item.id} className="model-review-item">
          <div className="model-review-item-heading">
            <strong>{item.display_name}</strong>
            <span className="model-review-stars" aria-label={`${item.rating} out of 5 stars`}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
          </div>
          <p>{item.review}</p>
          <time dateTime={item.created_at}>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.created_at))}</time>
        </article>)}
      </div> : null}
    </div>
  );
}
