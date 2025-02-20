import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/Common";
import Avatar from "./Avatar";
import { Colors } from "react-native/Libraries/NewAppScreen";
import moment from "moment";

interface NotificationItemProps {
  item:
    | {
        data: string;
        created_at: string;
        sender: {
          image: string;
          name: string;
        };
        title: string;
      }
    | any;
  navigation:
    | {
        push: (params: {
          pathname: string;
          params: { postId: string; commentId: string };
        }) => void | any;
      }
    | any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  navigation,
}) => {
  const handleClick = () => {
    let { postId, commentId } = JSON.parse(item?.data);
    navigation.push({ pathname: "postDetails", params: { postId, commentId } });
  };

  const createdAt = moment(item?.created_at).format("MMM DD");
  return (
    <TouchableOpacity style={styles.container} onPress={handleClick}>
      <Avatar uri={item?.sender?.image} size={hp(5)} />
      <View style={styles.nameTitle}>
        <Text style={styles.text}>{item?.sender?.name}</Text>
        {item.type === "chat" ? (
          <Text style={[styles.text, { color: theme.colors.textDark }]}>
            {item?.message}
          </Text>
        ) : (
          <Text style={[styles.text, { color: theme.colors.textDark }]}>
            {item?.title}
          </Text>
        )}
      </View>
      <Text style={[styles.text, { color: theme.colors.textLight }]}>
        {createdAt}
      </Text>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
});
