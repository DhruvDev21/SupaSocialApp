import { theme } from "../constants/theme";

export const statusStylesMock = [
  {
    status: "pending",
    icon: "pendingIcon",
    color: theme.colors.textLight,
    iconSize: 20,
  },
  {
    status: "processing",
    icon: "processingIcon",
    color: theme.colors.primary,
    iconSize: 24,
  },
  {
    status: "delivered",
    icon: "completedIcon",
    color: theme.colors.primaryDark,
    iconSize: 20,
  },
  {
    status: "cancelled",
    icon: "cancelledIcon",
    color: theme.colors.rose,
    iconSize: 20,
  },
];

export const categories = [
  { name: "Fashion", image: require("@/assets/images/fashion.jpg") },
  { name: "Beauty", image: require("@/assets/images/beauty.jpg") },
  { name: "Electronics", image: require("@/assets/images/electronics.jpg") },
  { name: "Accessories", image: require("@/assets/images/Accessories.jpg") },
  { name: "Home", image: require("@/assets/images/home.jpg") },
  { name: "Sports", image: require("@/assets/images/sports.jpg") },
]

export const offers = [
  {
    title: "50-40% OFF",
    subtitle: "Now in (product)",
    details: "All colours",
    backgroundColor: "#FFC0CB",
    image:require('@/assets/images/offerImage.png')
  },
  {
    title: "30% OFF",
    subtitle: "On selected items",
    details: "Limited time offer",
    backgroundColor: "#FFD700",
    image:require('@/assets/images/offerImage.png')
  },
  {
    title: "Buy 1 Get 1 Free",
    subtitle: "On accessories",
    details: "Hurry up!",
    backgroundColor: "#90EE90",
    image:require('@/assets/images/offerImage.png')
  },
];

export const deliveryStatuses = [
  "pending",
  "confirmed",
  "packed",
  "being shipped",
  "shipped",
  "out for delivery",
  "delivered",
];