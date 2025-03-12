import { supabase } from "@/lib/supabase";

export const fetchProducts = async (
  selectedCategory: string,
  selectedSubCategory: string
) => {
  let query = supabase.from("products").select("*");

  if (selectedCategory) {
    query = query.eq("gender", selectedCategory);
  }

  if (selectedSubCategory) {
    query = query.eq("category", selectedSubCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
};

export const fetchProductById = async (productId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data;
};

export const fetchSimilarProducts = async (category: string, productId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", productId) // Exclude the current product

  if (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }

  return data;
};
