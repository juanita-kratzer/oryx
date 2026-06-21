export const FileSystem = {
  documentDirectory: "/",
  cacheDirectory: "/tmp/",
  downloadAsync: async (url: string, fileUri: string) => ({
    uri: fileUri || url,
    status: 200,
    headers: {},
    mimeType: "application/vnd.apple.pkpass",
  }),
  readAsStringAsync: async () => "",
  writeAsStringAsync: async () => {},
  deleteAsync: async () => {},
  getInfoAsync: async () => ({ exists: false, isDirectory: false }),
};
