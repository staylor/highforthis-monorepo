export const uploadUrl = (destination: string, fileName: string) => {
  return `https://storage.googleapis.com/wonderboymusic/${destination}/${fileName}`;
};
