import { supabase } from "@/lib/supabase";

export const placeOrder = async (orderData: any) => {
  try {
    const { data, error } = await supabase.from("orders").insert([orderData]);

    if (error) {
      console.log("Error placing order:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.log("Unexpected error:", error);
    return { success: false, message: "Unexpected error occurred." };
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }); // Get orders by latest first

    if (error) {
      console.log("Error fetching orders:", error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.log("Unexpected error:", err);
    return [];
  }
};

export const getLastOrder = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
  
      if (error) {
        console.log("Error fetching last order:", error.message);
        return null;
      }
  
      return data?.[0] || null;  // Return the last order or null if none
    } catch (err) {
      console.log("Unexpected error:", err);
      return null;
    }
  };
  
  export const cancelOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
  
      if (error) {
        console.log("Error cancelling order:", error.message);
        return { success: false, message: error.message };
      }
  
      return { success: true, data };
    } catch (err) {
      console.log("Unexpected error:", err);
      return { success: false, message: "Unexpected error occurred." };
    }
  };

  export const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*") // Assuming "items" is a related table with foreign key
        .eq("id", orderId)
        .single(); // Use .single() to get a single object instead of an array
  
      if (error) {
        console.error("Error fetching order details:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error in fetchOrderDetails:", err);
      return null;
    }
  };