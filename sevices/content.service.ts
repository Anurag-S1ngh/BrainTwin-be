import { ContentModel } from "../mongodb/db";

export const fetchContent = async (userID: string) => {
  return await ContentModel.find({ userId: userID }).sort({
    _id: -1,
  });
};

export const deleteContent = async (contentId: string, userID: string) => {
  return await ContentModel.findOneAndDelete({
    _id: contentId,
    userId: userID,
  });
};
