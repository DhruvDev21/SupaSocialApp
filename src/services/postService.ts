import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";
import { Comment, PostLike } from "../constants/type";

export const createOrUpdatePost = async (post: any) => {
  try {
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileresult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileresult?.success) post.file = fileresult?.data;
      else {
        return fileresult;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.error("create post error", error);
      return { sucess: false, msg: "could not create your post" };
    }
    return { success: true, data: data };
  } catch (e) {
    console.error("error uploding the post", e);
    return { success: false, msg: "could create your post" };
  }
};
export const fetchPosts = async (limit: number = 10, userId?:string) => {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user: users(id,name,image),
          postLikes(*),
          comments (count)
          `
        )
        .order("created_at", { ascending: false })
        .eq("userid", userId)
        .limit(limit);

      if (error) {
        console.error("error fetching posts", error);
        return { success: false, msg: "could not fetch the posts" };
      }
      return { sucess: true, data: data ?? []};
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
        *,
        user: users(id,name,image),
        postLikes(*),
        comments (count)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("error fetching posts", error);
        return { success: false, msg: "could not fetch the posts" };
      }
      return { sucess: true, data: data };
    }
  } catch (e) {
    console.error("error fetching the post", e);
    return { success: false, msg: "could not fetch your post" };
  }
};

export const fetchPostDetails = async (postId:string | any) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user: users(id,name,image),
        postLikes(*),
        comments (*, user: users(id, name, image))
        `
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.error("error fetching post details", error);
      return { success: false, msg: "could not fetch the post details" };
    }
    return { sucess: true, data: data };
  } catch (e) {
    console.error("error fetching the post details", e);
    return { success: false, msg: "could not fetch your post details" };
  }
};

export const createPostLike = async (postLike: PostLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.error("post like  error", error);
      return { success: false, msg: "could not like the post" };
    }
    return { success: true, data: data };
  } catch (e) {
    console.error("post like  error", e);
    return { success: false, msg: "could not like your post" };
  }
};

export const removePostLike = async (postId:string, userId:string) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);
    if (error) {
      console.error("post like remove  error", error);
      return { success: false, msg: "could not remove the like in the post" };
    }
    console.log(' the data>>>>>>>>>',data)
    return { data ,success: true };
  } catch (e) {
    console.error("post like remove  error", e);
    return { success: false, msg: "could not remove the like in the post" };
  }
};

export const createComment = async (comment: Comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.error("Comment error", error);
      return { success: false, msg: "could not comment the post" };
    }
    return { success: true, data: data };
  } catch (e) {
    console.error("Comment error", e);
    return { success: false, msg: "could not comment your post" };
  }
};

export const removeComment = async (commentId:string) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      console.error("post comment remove  error", error);
      return {
        success: false,
        msg: "could not remove the comment in the post",
      };
    }
    return { success: true, data: { commentId } };
  } catch (e) {
    console.error("post like comment  error", e);
    return { success: false, msg: "could not remove the comment in the post" };
  }
};

export const removePost = async (postId:string) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error("post remove  error", error);
      return {
        success: false,
        msg: "could not remove the post",
      };
    }
    return { success: true, data: { postId } };
  } catch (e) {
    console.error("post like comment  error", e);
    return { success: false, msg: "could not remove the post" };
  }
};
