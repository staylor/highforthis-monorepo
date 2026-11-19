// Where an upload is stored. Browser code uses it too, such as the post editor's images.
export const uploadUrl = (destination: string, fileName: string) => {
  return `https://storage.googleapis.com/wonderboymusic/${destination}/${fileName}`;
};
