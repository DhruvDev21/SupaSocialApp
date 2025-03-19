import { supabase } from "@/lib/supabase"

export const fetchReviews = async (productId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching review:", error.message)
    }

    return data
  } catch (e) {
    console.error("Failed to fetch review:", e)
    return null
  }
}

export const updateRating = async (productId: string, userId: string, rating: number) => {
  try {
    const existingReview = await fetchReviews(productId, userId)

    const { data, error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: userId,
        rating,
        comment: existingReview?.comment || "",
      },
      { onConflict: "product_id,user_id" },
    )

    if (error) {
      console.error("Error updating rating:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("Failed to update rating:", e)
    return null
  }
}

export const submitReview = async (productId: string, userId: string, comment: string) => {
  try {
    const existingReview = await fetchReviews(productId, userId)

    const { data, error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: userId,
        comment,
        rating: existingReview?.rating || 0,
      },
      { onConflict: "product_id,user_id" },
    )

    if (error) {
      console.error("Error submitting review:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("Failed to submit review:", e)
    return null
  }
}

export const submitFullReview = async (productId: string, userId: string, comment: string, rating: number) => {
  try {
    const { data, error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: userId,
        comment,
        rating,
      },
      { onConflict: "product_id,user_id" },
    )

    if (error) {
      console.error("Error submitting full review:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("Failed to submit full review:", e)
    return null
  }
}

export const fetchProdectReviews = async (productId: string | string[]) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching reviews:", error.message);
    return { data: [], error };
  }

  return { data, error: null };
};
export const fetchProdectAllReviews = async (productId: string | string[]) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching reviews:", error.message);
    return { data: [], error };
  }

  return { data, error: null };
};
