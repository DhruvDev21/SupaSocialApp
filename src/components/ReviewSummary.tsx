import Icon from "@/assets/icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Svg, Rect } from "react-native-svg";
import { screenWidth, wp } from "../helpers/Common";
import { Review } from "../constants/type";

// type Review = {
//   rating: number;
// };

type ReviewSummaryProps = {
  reviews: Review[];
};

const progressBarWidth = screenWidth * 0.55;

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews }) => {
  const totalReviews = reviews.length;
  const ratingCounts: number[] = [0, 0, 0, 0, 0];

  reviews.forEach(({ rating }) => {
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  });

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, { rating }) => sum + rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {[5, 4, 3, 2, 1].map((star) => {
          const percentage =
            totalReviews > 0
              ? (ratingCounts[5 - star] / totalReviews) * 100
              : 0;

          return (
            <View key={star} style={styles.row}>
              <Text style={styles.starText}>{star}</Text>
              <Icon name="filledStar" color="#c7922e" size={12} />
              <Svg
                height="8"
                width={progressBarWidth}
                style={styles.progressBar}
              >
                <Rect
                  x="0"
                  y="0"
                  width={progressBarWidth}
                  height="8"
                  fill="#ddd"
                  rx="4"
                />
                <Rect
                  x="0"
                  y="0"
                  width={`${percentage}%`}
                  height="8"
                  fill="#c7922e"
                  rx="4"
                />
              </Svg>
              <Text style={styles.count}>({ratingCounts[5 - star]})</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.rightSection}>
        <View style={styles.avgContainer}>
          <Icon name="filledStar" color="#c7922e" size={20} />
          <Text style={styles.averageRating}>{averageRating}</Text>
        </View>
        <Text style={styles.reviewCount}>{totalReviews} Reviews</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  rightSection: {
    alignItems: "center",
    marginLeft: 20,
  },
  avgContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  averageRating: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
  },
  leftSection: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  progressBar: {
    marginLeft: 4,
    marginRight: 4,
  },
  count: {
    fontSize: 14,
    color: "#666",
  },
});

export default ReviewSummary;
