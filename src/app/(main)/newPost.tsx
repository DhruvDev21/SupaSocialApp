import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import Header from "@/src/components/Header";
import { hp, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import Avatar from "@/src/components/Avatar";
import { useAuth } from "@/src/contexts/AuthContext";
import RichTextEditor from "@/src/components/RichTextEditor";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "@/assets/icons";
import Button from "@/src/components/Button";
import * as ImagePicker from "expo-image-picker";
import { mediaType } from "@/src/constants/type";
import { Image } from "expo-image";
import { getSupabaseFileUrl } from "@/src/services/imageService";
import { useVideoPlayer, VideoView } from "expo-video";
import { createOrUpdatePost } from "@/src/services/postService";

interface RichTextEditorRef {
  setContentHTML: (html: string) => void;
}

interface MediaFile {
  uri: string;
  type: string;
  includes?: string | any;
}

const NewPost = () => {
  const post = useLocalSearchParams();
  console.log(" the edit post data", post);
  const { user } = useAuth();
  console.log("user", user);
  const bodyRef = useRef("");
  const editorRef = useRef<RichTextEditorRef>(null);
  const navigation = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState(file);
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = Array.isArray(post.body) ? post.body[0] : post.body || "";
      setFile(post?.file || null);
      editorRef?.current?.setContentHTML(bodyRef.current);
    }
  }, []);
  

  const onPick = async (isImage: boolean) => {
    let mediaConfig: mediaType | any = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ["videos"],
        allowsEditing: true,
      };
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    console.log("the selected image", result);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file: MediaFile) => {
    if (!file) return null;
    if (typeof file == "object") return true;

    return false;
  };

  const getFileType = (file: MediaFile) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes("postImage")) {
      return "images";
    }
    return "videos";
  };

  const getFileuri = (file: MediaFile | any) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    if (typeof file === "string") return file; // Ensure URL is returned

    return getSupabaseFileUrl(file)?.uri;
  };
  const player = useVideoPlayer(getFileuri(file), (player) => {
    player.loop = true;
    player.play();
  });

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert("Post", "please chose an image or enter text to post");
      return;
    }

    let data = {
      file,
      body: bodyRef.current,
      userid: user?.id,
    };

    if(post && post.id) data.id = post.id

    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if (res?.success) {
      setFile(null);
      bodyRef.current = "";
      editorRef?.current?.setContentHTML("");
      navigation.back();
    }
  };
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Create Post" />
        <ScrollView
          contentContainerStyle={{ gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user && user?.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body: string) => (bodyRef.current = body)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <VideoView
                  contentFit="cover"
                  style={{ flex: 1 }}
                  player={player}
                  allowsPictureInPicture
                />
              ) : (
                <Image
                  source={{ uri: getFileuri(file) }}
                  style={{ flex: 1, resizeMode: "cover" }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name={"delete"} size={20} color={"white"} />
              </Pressable>
            </View>
          )}

          <View style={styles.media}>
            <Text style={styles.addimageText}>Add to your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name={"image"} size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name={"video"} size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <Button
          btnStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  addimageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  textEditor: {},
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,0,0,0.6)",
    padding: 6,
    borderRadius: 50,
  },
});
