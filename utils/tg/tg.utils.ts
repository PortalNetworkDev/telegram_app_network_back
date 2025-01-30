import TelegramBot from "node-telegram-bot-api";

export const getUserAvatarUrlIfItExists = async (
  bot: TelegramBot,
  userId: number
) => {
  const photos = await bot.getUserProfilePhotos(userId);
  if (photos.total_count > 0) {
    const userAvatarUrl = await bot.getFileLink(photos.photos[0][0].file_id);

    return userAvatarUrl;
  }
  return "";
};
