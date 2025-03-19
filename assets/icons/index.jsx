import { View, Text } from "react-native";
import React from "react";
import Home from "./Home";
import Mail from "./Mail";
import Lock from "./Lock";
import User from "./User";
import Heart from "./Heart";
import Plus from "./Plus";
import Search from "./Search";
import Location from "./Location";
import Call from "./Call";
import { theme } from "../../src/constants/theme";
import Camera from "./Camera";
import Edit from "./Edit";
import ArrowLeft from "./ArrowLeft";
import ThreeDotsCircle from "./ThreeDotsCircle";
import ThreeDotsHorizontal from "./ThreeDotsHorizontal";
import Comment from "./Comment";
import Share from "./Share";
import Send from "./Send";
import Delete from "./Delete";
import Logout from "./logout";
import Image from "./Image";
import Video from "./Video";
import ChatIcon from "./ChatIcon";
import addIcon from "./addIcon";
import shopping from "./shopping";
import bag from "./bag";
import plusIcon from "./plusIcon";
import minus from "./minus";
import close from "./close";
import circle from "./circle";
import checkedCirlce from "./checkedCirlce";
import order from "./order";
import pendingIcon from "./pendingIcon";
import cancelledIcon from "./cancelledIcon";
import processingIcon from "./processingIcon";
import completedIcon from "./completedIcon";
import upArrow from "./upArrow";
import downArrow from "./downArrow";
import saved from "./saved";
import unSaved from "./unSaved";
import emptyStar from "./emptyStar";
import filledStar from "./filledStar";

const icons = {
  home: Home,
  mail: Mail,
  lock: Lock,
  user: User,
  heart: Heart,
  plus: Plus,
  search: Search,
  location: Location,
  call: Call,
  camera: Camera,
  edit: Edit,
  arrowLeft: ArrowLeft,
  threeDotsCircle: ThreeDotsCircle,
  threeDotsHorizontal: ThreeDotsHorizontal,
  comment: Comment,
  share: Share,
  send: Send,
  delete: Delete,
  logout: Logout,
  image: Image,
  video: Video,
  ChatIcon: ChatIcon,
  addIcon: addIcon,
  shopping: shopping,
  bag: bag,
  plusIcon: plusIcon,
  minus: minus,
  close: close,
  circle: circle,
  checkedCirlce: checkedCirlce,
  order: order,
  pendingIcon: pendingIcon,
  cancelledIcon: cancelledIcon,
  processingIcon: processingIcon,
  completedIcon: completedIcon,
  upArrow: upArrow,
  downArrow: downArrow,
  saved: saved,
  unSaved: unSaved,
  emptyStar: emptyStar,
  filledStar: filledStar,
};

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.9}
      color={theme.colors.textLight}
      {...props}
    />
  );
};

export default Icon;
