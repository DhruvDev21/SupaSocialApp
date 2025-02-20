import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/Common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "@/assets/icons";

interface User {
  image: string;
  name: string;
}

interface CommentItemProps {
  item:
    | {
        created_at: string;
        user: User;
        text: string;
      }
    | any;
  canDelete?: boolean;
  onDelete?: (item: any) => void;
  highlight?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  item,
  canDelete = false,
  onDelete = () => {},
  highlight = false,
}) => {
  const createdAt = moment(item?.created_at).format("MMM d");

  const handleDelete = () => {
    Alert.alert("confirm", "Are you sure you want to do this?", [
      {
        text: "Cancel",
        onPress: () => console.log(" modal cancelled"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <Avatar uri={item?.user?.image} />
      <View style={[styles.content, highlight && styles.highlight]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={styles.nameContainer}>
            <Text style={styles.text}>{item?.user?.name}</Text>
            <Text style={{ fontSize: 15 }}>•</Text>
            <Text style={[styles.text, { color: theme.colors.textLight }]}>
              {createdAt}
            </Text>
          </View>
          {canDelete && (
            <TouchableOpacity onPress={handleDelete}>
              <Icon name="delete" size={20} color={theme.colors.rose} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.text, { fontWeight: "normal" }]}>
          {item?.text}
        </Text>
      </View>
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
  },
  content: {
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  highlight: {
    borderWidth: 0.2,
    backgroundColor: "white",
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
});
