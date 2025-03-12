import { supabase } from "@/lib/supabase";

// Fetch user addresses
export const fetchUserAddresses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("addresses") // Updated table name
      .select("*")
      .eq("user_id", userId) // Updated field name
      .order("created_at", { ascending: false });

    return data || [];
    // if (error) throw error;
  } catch (err) {
    console.error("Error fetching addresses:", err);
    return [];
  }
};

// Add new address
export const addUserAddress = async (userId: string, addressData: any) => {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .insert([{ user_id: userId, ...addressData }]) // Changed id to user_id
      .select();

    if (data && data.length > 0) {
      return data; // Return data if insert was successful
    } else {
      console.warn("Address added but no data returned.");
      return []; // Return empty array if no data but no error
    }
  } catch (err) {
    console.error("Error adding address:", err);
    return null;
  }
};

// Update user address
export const updateUserAddress = async (addressId: string, addressData: any) => {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", addressId)
      .select()

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error updating address:", err);
    return null;
  }
};
