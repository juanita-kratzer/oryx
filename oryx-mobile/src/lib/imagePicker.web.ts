type PickerAsset = { uri: string };
type PickerResult = {
  canceled: boolean;
  assets?: PickerAsset[];
};

export const MediaTypeOptions = {
  Images: "images",
  Videos: "videos",
  All: "all",
};

function pickImage(): Promise<PickerResult> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ canceled: true });
        return;
      }
      resolve({
        canceled: false,
        assets: [{ uri: URL.createObjectURL(file) }],
      });
    };
    input.click();
  });
}

export async function requestCameraPermissionsAsync() {
  return { status: "granted" as const };
}

export async function requestMediaLibraryPermissionsAsync() {
  return { status: "granted" as const };
}

export async function launchCameraAsync(
  _options?: Record<string, unknown>
): Promise<PickerResult> {
  return pickImage();
}

export async function launchImageLibraryAsync(
  _options?: Record<string, unknown>
): Promise<PickerResult> {
  return pickImage();
}
