import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";
import { supabaseUrl } from "../constants";

export const getUserImageSrc = (imagePath: string) => {
  if (imagePath) {
    return { uri: imagePath };
  } 
  // else {
  //   return require("../../assets/images/defaultuser.png");
  // }
};

export const getSupabaseFileUrl = (filePath: string) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  }
  return null;
};

export const uploadFile = async (
  folderName: string,
  imageUri: string,
  isImage = true
) => {
  try {
    if (!imageUri.startsWith("file://")) return null;
    const fileName = getFilePath(folderName, isImage);
    const fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const filePath = `${folderName}/${Crypto.randomUUID()}${
      isImage ? ".png" : ".mp4"
    }`;
    const fileData = decode(fileBase64);

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, fileData, {
        contentType: isImage ? "image/png" : "video/mp4",
      });

    if (error) {
      console.error("Error uploading file:", error);
      return { success: false, msg: "Could not upload media" };
    }

    const { data: publicURL } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    return { success: true, data: publicURL.publicUrl };
  } catch (e) {
    console.error("Error uploading file:", e);
    return { success: false, msg: "Could not upload media" };
  }
};

// export const uploadFile = async (imageUri: string, currentUserid: string) => {
//   try {
//     if (!imageUri.startsWith("file://")) return null;

//     // Convert image to base64
//     const base64 = await FileSystem.readAsStringAsync(imageUri, {
//       encoding: "base64",
//     });
//     const filePath = `profiles/${Crypto.randomUUID()}.png`; // Unique filename
//     const contentType = "image/png";

//     // Upload to Supabase
//     const { data, error } = await supabase.storage
//       .from("uploads") // Make sure this is your bucket name
//       .upload(filePath, decode(base64), { contentType });

//     if (error) {
//       console.error("Upload Error:", error);
//       return null;
//     }

//     // Get the public URL of the uploaded file
//     const { data: publicURL } = supabase.storage
//       .from("uploads")
//       .getPublicUrl(filePath);
//     return publicURL.publicUrl;
//   } catch (error) {
//     console.error("Upload File Error:", error);
//     return null;
//   }
// };

const getFilePath = (folderName: string, isImage: boolean) => {
  return `${folderName}/${Crypto.randomUUID()}${isImage ? ".png" : ".mp4"}`;
};

// import * as FileSystem from "expo-file-system";
export const downloadFile = async (url:string) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri;
  } catch (error) {
    return null;
  }
};

export const getLocalFilePath = (filepath:string) => {
  let fileName = filepath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};
