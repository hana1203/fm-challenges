export const GROUP_NAME = "Chess Club";

type TargetOfPost = {
  type: "POST";
  title: string;
};
type TargetOfGroup = {
  type: "GROUP";
  name: string;
};
type TargetOfMessage = {
  type: "MESSAGE";
  details: string;
};
type TargetOfPicture = {
  type: "PICTURE";
  pictureSrc: string;
};

export type TargetType = "POST" | "GROUP" | "MESSAGE" | "PICTURE";

type Target = TargetOfPost | TargetOfGroup | TargetOfMessage | TargetOfPicture;

export interface Data {
  avatarSrc: string;
  name: string;
  action: string;
  target?: Target;
  timestamp: string;
  seen: boolean;
}

export const data: Data[] = [
  {
    avatarSrc: "../assets/images/avatar-mark-webber.webp",
    name: "Mark Webber",
    action: "reacted to your recent post",
    target: {
      type: "POST",
      title: "My first tournament today!",
    },
    timestamp: "1m ago",
    seen: false,
  },
  {
    avatarSrc: "../assets/images/avatar-angela-gray.webp",
    name: "Angela Gray",
    action: "followed you",
    timestamp: "5m ago",
    seen: false,
  },
  {
    avatarSrc: "",
    name: "Jacob Thompson",
    action: "has joined your group",
    target: {
      type: "GROUP",
      name: GROUP_NAME,
    },
    timestamp: "1 day ago",
    seen: false,
  },
  {
    avatarSrc: "",
    name: "Rizky Hasanuddin",
    action: "sent you a private message",
    target: {
      type: "MESSAGE",
      details:
        "Hello, thanks for setting up the Chess Club. I've been a member for a few weeks now and I'm already having lots of fun and improving my game.",
    },
    timestamp: "5days ago",
    seen: true,
  },
  {
    avatarSrc: "",
    name: "Kimberly Smith",
    action: "commented on your picture",
    target: {
      type: "PICTURE",
      pictureSrc: "",
    },
    timestamp: "1 week ago",
    seen: true,
  },
  {
    avatarSrc: "",
    name: "Nathan Peterson",
    action: "reacted to your recent post",
    target: {
      type: "POST",
      title: "5 end-game strategies to increase your win rate",
    },
    timestamp: "2 weeks ago",
    seen: true,
  },
  {
    avatarSrc: "",
    name: "Anna Kim",
    action: "left the group",
    target: {
      type: "GROUP",
      name: GROUP_NAME,
    },
    timestamp: "2 weeks ago",
    seen: true,
  },
];
