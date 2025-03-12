import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostDetails,
  removeComment,
  removePost,
} from "@/src/services/postService";
import { hp, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import PostCard from "@/src/components/PostCard";
import { useAuth } from "@/src/contexts/AuthContext";
import Loading from "@/src/components/loading";
import Input from "@/src/components/input";
import Icon from "@/assets/icons";
import CommentItem from "@/src/components/CommentItem";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/src/services/userService";
import { createNotification, NotificationPayload } from "@/src/services/notificationService";
import ScreenWrapper from "@/src/components/ScreenWrapper";

interface Comment {
  id: string;
  userId: string;
  text: string;
  user: any;
}

interface Payload {
  new: Comment;
}
interface postData {
  id: string;
  userid: string;
  comments: any;
}

const PostDetails = () => {
  const { postId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const navigation = useRouter();
  const inputRef = useRef<any>(null);
  const commentRef = useRef("");
  const [post, setPost] = useState<postData>({
    id: "",
    userid: "",
    comments: [],
  });
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  const handlenewComment = async (payload: Payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prevPost: any) => {
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments],
        };
      });
    }
  };

  useEffect(() => {
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handlenewComment
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getPostDetails = async () => {
    let res = await fetchPostDetails(postId);
    console.log("the post data", res);
    if (res.sucess) setPost(res.data);
    setLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current || !user?.id) return;
  
    let data = {
      userId: user.id,
      postId: post?.id,
      text: commentRef.current,
    };
  
    setCommentLoading(true);
    let res = await createComment(data);
    setCommentLoading(false);
  
    if (res.success) {
      if (user.id !== post.userid) {
        let notify: NotificationPayload = {
          senderId: user.id,
          receiverId: post.userid,
          title: "New Comment on Your Post",
          message: "Someone commented on your post!",
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
          type: "comment",
        };
        createNotification(notify);
      }
  
      inputRef?.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };
  const onDeleteComment = async (comment: any) => {
    let res = await removeComment(comment?.id);
    console.log("remove comment response", res);
    if (res.success) {
      setPost((prevPost: any) => {
        let updatePost = { ...prevPost };
        updatePost.comments = updatePost.comments.filter(
          (c: any) => c.id != comment.id
        );
        return updatePost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeletepost = async () => {
    let res = await removePost(post.id);
    if (res.success) {
      navigation.back();
    } else {
      Alert.alert("Post", res.msg);
    }
  };
  const onEditPost = async (item: any) => {
    navigation.back();
    navigation.push({ pathname: "/(main)/newPost", params: { ...item } });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Post not found !</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <PostCard
            item={{ ...post, comments: [{ count: post.comments.length }] }}
            currentUser={user}
            navigation={navigation}
            hasShadow={false}
            showMoreIcon={false}
            showDelete={true}
            onDelete={onDeletepost}
            onEdit={() => onEditPost(post)}
          />

          <View style={styles.inputContainer}>
            <Input
              inputRef={inputRef}
              placeholder="Type comment..."
              onChangeText={(value) => (commentRef.current = value)}
              placeholderTextColor={theme.colors.textLight}
              containerStyles={{
                flex: 1,
                height: hp(6.3),
                width:hp(35),
                borderRadius: theme.radius.xl,
              }}
            />
            {commentLoading ? (
              <View style={styles.loading}>
                <Loading size={"small"} />
              </View>
            ) : (
              <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                <Icon name={"send"} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginVertical: 15, gap: 17 }}>
            {post?.comments?.map((comment: Comment) => (
              <CommentItem
                key={comment?.id.toString()}
                item={comment}
                canDelete={
                  user?.id === comment.userId || user?.id == post.userid
                }
                onDelete={() => onDeleteComment(comment)}
                highlight={comment.id == commentId}
              />
            ))}

            {post?.comments?.length == 0 && (
              <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                Be first to comment!
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
