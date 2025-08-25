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
  id: string;
  avatarSrc: string;
  name: string;
  action: string;
  target?: Target;
  timestamp: string;
  seen: boolean;
}
