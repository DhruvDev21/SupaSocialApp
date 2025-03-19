import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Icon from "@/assets/icons";
import moment from "moment"; // For formatting the date
import { Review } from "../constants/type";
import { getUserData } from "../services/userService";
import { wp } from "../helpers/Common";

type ReviewWithUser = Review & {
  user_id: string;
};

type ReviewItemProps = {
  review: ReviewWithUser;
};

const ReviewContent: React.FC<ReviewItemProps> = ({ review }) => {
    console.log('the review data',review)
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUserData(review.user_id);
      if (result.success) {
        setUser(result.data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [review.user_id]);

  return (
    <View style={styles.reviewContainer}>
      {loading ? (
        <ActivityIndicator size="small" color="#c7922e" />
      ) : (
        <>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Unknown User"}</Text>
            {/* <Icon name="verified" type="font-awesome" color="#1DA1F2" size={12} /> */}
            <Text style={styles.reviewDate}>{moment(review.created_at).fromNow()}</Text>
          </View>

          {/* Star Ratings */}
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name="filledStar"
                type="font-awesome"
                color={i < review.rating ? "#c7922e" : "#ddd"}
                size={14}
              />
            ))}
          </View>

          {/* Review Comment */}
          <Text style={styles.comment}>{review.comment}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    backgroundColor: "#FEF7E5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 4,
    gap:wp(1)
  },
  comment: {
    marginTop: 6,
    fontSize: 14,
    color: "#333",
  },
});

export default ReviewContent;
