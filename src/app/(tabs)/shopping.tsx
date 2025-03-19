import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { theme } from "@/src/constants/theme";
import { hp, wp } from "@/src/helpers/Common";
import Icon from "@/assets/icons";
import { useRouter } from "expo-router";
import ProductList from "@/src/components/ProductList";
import { fetchProducts } from "@/src/services/productServices";
import Loading from "@/src/components/loading";
import { Product } from "@/src/constants/type";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { categories, offers } from "@/src/helpers/mockData";
import { Image } from "expo-image";

const SCREEN_WIDTH = Dimensions.get("window").width;

const shopping = () => {
  const navigation = useRouter();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<
    "Men" | "Women" | "All" | ""
  >("All");

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const data = await fetchProducts(
        selectedCategory === "All" ? "" : selectedCategory,
        selectedSubCategory
      );
      if (data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    };

    getProducts();
  }, [selectedCategory, selectedSubCategory]);

  const bagCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SupaSocial Shop</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                navigation.push("/(main)/notification");
              }}
            >
              <Icon
                name={"heart"}
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                navigation.push("/orderScreen");
              }}
            >
              <Icon
                name={"order"}
                size={hp(3.2)}
                color={theme.colors.text}
                strokeWidth={0}
              />

              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                navigation.push("/bag");
              }}
            >
              <Icon
                name={"bag"}
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {bagCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{bagCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={hp(2.5)} color={theme.colors.dark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Subcategories */}
        <View style={styles.categoryContainer}>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.categoryItem}
                onPress={() =>
                  setSelectedSubCategory((prev) =>
                    prev === item.name ? "" : item.name
                  )
                }
              >
                <View
                  style={[
                    styles.imageWrapper,
                    selectedSubCategory === item.name &&
                      styles.activeSubCategory,
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.categoryImage}
                    contentFit="fill"
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedSubCategory === item.name &&
                      styles.activeSubCategoryTitle,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
          />

          {/* Category Selection */}
          {/* Category Selection */}
          <View style={styles.categoryBar}>
            {["Men", "All", "Women"].map((category, index) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  category === "Men" && styles.menButton,
                  category === "Women" && styles.womenButton,
                  category === "All" && styles.allButton, // New style for "All"
                  selectedCategory === category && styles.activeCategory,
                ]}
                onPress={() =>
                  setSelectedCategory((prev) =>
                    prev === category
                      ? ""
                      : (category as "Men" | "Women" | "All")
                  )
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.activeText,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Product List */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <Loading />
            </View>
          ) : (
            <ProductList data={filteredProducts} />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default shopping;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: theme.colors.darkLight,
    backgroundColor: "#E1E1E199",
    borderRadius: theme.radius.lg,
    paddingHorizontal: wp(3),
    marginHorizontal: wp(4),
    marginBottom: wp(3),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: hp(1.8),
    color: theme.colors.text,
    padding:wp(2.5)
  },
  categoryContainer: {
    // borderBottomWidth: 1,
    // borderColor: '',
  },
  categoryList: {
    paddingLeft: wp(4),
    paddingRight: wp(4),
    marginBottom: wp(3),
    gap: wp(7.3),
  },
  categoryItem: {
    alignItems: "center",
  },
  imageWrapper: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Optional: Background color for circular effect
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  categoryLabel: {
    marginTop: hp(0.5),
    fontSize: hp(1.6),
    color: theme.colors.text,
    textAlign: "center",
  },
  activeSubCategoryTitle: {
    color: theme.colors.primary,
    borderBottomWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryBar: {
    flexDirection: "row",
    justifyContent: "center",
    minWidth: wp(46),
    gap:wp(3),
    marginHorizontal:wp(4)
  },
  categoryButton: {
    minWidth: wp(30),
    paddingVertical: hp(0.5),
    borderBottomWidth:1.5,
    borderColor:theme.colors.textLight,
    alignItems: "center",
  },
  menButton: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginLeft:wp(1)
  },
  womenButton: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginRight:wp(1)
  },
  allButton: {},
  activeCategory: {
    borderColor:theme.colors.primary
  },
  categoryText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  activeText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  activeSubCategory: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: { color: "white", fontSize: hp(1.2), fontWeight: theme.fonts.bold },
});
