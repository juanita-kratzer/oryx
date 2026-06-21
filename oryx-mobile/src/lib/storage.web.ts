export async function uploadCardImage(
  _cardId: string,
  uri: string
): Promise<string> {
  return uri;
}

export async function uploadLogo(
  cardId: string,
  uri: string
): Promise<{ url: string }> {
  const url = await uploadCardImage(cardId, uri);
  return { url };
}

export async function deleteCardImage(_storagePath: string): Promise<void> {}
