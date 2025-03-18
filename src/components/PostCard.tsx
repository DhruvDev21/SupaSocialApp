import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { hp, stripHtmlTags, wp } from "../helpers/Common";
import moment from "moment";
import Icon from "@/assets/icons";
import RenderHtml from "react-native-render-html";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./loading";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { savePost, toggleLike, unsavePost } from "../redux/savedPostsSlice";
import eventEmitter from "../utils/EventEmitter";

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};

interface User {
  id: string;
  name: string;
  image: string;
}

interface Like {
  userId: string;
}

interface PostCardProps {
  item: any;
  currentUser: User | any;
  navigation: any;
  hasShadow?: boolean;
  showMoreIcon?: boolean;
  showDelete?: boolean;
  onDelete?: (item: any) => void;
  onEdit?: (item: any) => void;
  profileClick?: boolean;
}

const PostCard = ({
  item,
  currentUser,
  navigation,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
  profileClick = true,
}: PostCardProps) => {
  const shadowStyle = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 5,
  };

  const [likes, setLikes] = useState(item?.postLikes || []);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const savedPosts = useSelector(
    (state: RootState) => state.savedPosts.savedPosts
  );
  const isSaved = savedPosts.some((post) => post.id === item.id);

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item?.postLikes]);

  const createdAt = moment(item?.created_at).format("MMM D");

  const openPostDetails = () => {
    if (!showMoreIcon) return null;

    navigation.push({
      pathname: "/(main)/postDetails",
      params: { postId: item?.id },
    });
  };

  const player = useVideoPlayer(item?.file, (player) => {
    player.loop = false;
    player.play();
  });

  const onLike = async () => {
    let updatedLikes;

    if (liked) {
      updatedLikes = likes.filter((like: Like) => like.userId !== currentUser?.id);
      setLikes([...updatedLikes]);
      const res = await removePostLike(item?.id, currentUser?.id);

      if (!res.success) {
        Alert.alert("Error", "Something went wrong while unliking the post.");
        return;
      }
    } else {
      const data = { userId: currentUser?.id, postId: item?.id };
      updatedLikes = [...likes, data];
      setLikes(updatedLikes);
      const res = await createPostLike(data);

      if (!res.success) {
        Alert.alert("Error", "Something went wrong while liking the post.");
        return;
      }
    }

    dispatch(toggleLike({ ...item, postLikes: updatedLikes }));

    eventEmitter.emit("postLikeChanged", {
      postId: item.id,
      likes: updatedLikes,
    });
  };

  const onShare = async () => {
    setShareLoading(true);
    let content: { title?: string; message: string; url?: string } = {
      message: "",
    };

    if (Platform.OS === "android") {
      content = {
        title: stripHtmlTags(item?.body),
        message: `${stripHtmlTags(item?.body)}\n\n${item?.file || ""}`.trim(),
      };
    } else {
      content = {
        message: stripHtmlTags(item?.body),
      };
      if (item?.file) {
        content.url = item.file;
      }
    }

    try {
      const result = await Share.share(content);
      setShareLoading(false);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        setShareLoading(false);
        console.log("Share dismissed");
      }
    } catch (error: any) {
      setShareLoading(false);
      Alert.alert("Error", error);
    }
  };

  const handlePostDelete = () => {
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

  const liked: boolean = likes?.filter(
    (like: Like) => like.userId == currentUser?.id
  )[0]
    ? true
    : false;

  const handelProfileClick = () => {
    navigation.push({
      pathname: "/(main)/profile",
      params: { userId: item?.user?.id },
    });
  };

  const handleSavePost = () => {
    if (isSaved) {
      dispatch(unsavePost(item.id));
    } else {
      dispatch(savePost(item));
    }
  };
  return (
    <View style={[styles.container, hasShadow && shadowStyle]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={handelProfileClick}
          disabled={!profileClick ? true : false}
        >
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </TouchableOpacity>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
        {showDelete && currentUser.id == item?.userid && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon
                name="edit"
                size={hp(2.5)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon
                name="delete"
                size={hp(2.5)}
                strokeWidth={2}
                color={theme.colors.rose}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHtml
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>
        {item?.file && item?.file?.includes("postImages") && (
          <Image
            source={item?.file}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}
        {item?.file && item?.file?.includes("postVideos") && (
          <VideoView
            style={[styles.postMedia, { height: hp(30) }]}
            player={player}
            contentFit="cover"
          />
        )}
      </View>
      <View style={styles.footer}>
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              <Icon
                name={"heart"}
                fill={liked ? theme.colors.rose : "none"}
                color={liked ? theme.colors.rose : theme.colors.textLight}
                size={24}
              />
            </TouchableOpacity>
            <Text style={styles.count}>{likes?.length || 0}</Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name={"comment"} color={theme.colors.textLight} size={24} />
            </TouchableOpacity>
            <Text style={styles.count}>{item?.comments[0].count}</Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onShare}>
              {shareLoading ? (
                <Loading size={"small"} />
              ) : (
                <Icon name={"share"} color={theme.colors.textLight} size={24} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.footerButton, { marginRight: wp(2) }]}>
          <TouchableOpacity onPress={handleSavePost}>
            <Icon
              name={isSaved ? "saved" : "unSaved"}
              color={theme.colors.textLight}
              size={22}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postBody: {
    marginLeft: 5,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});
