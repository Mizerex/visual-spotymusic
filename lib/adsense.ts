export function isValidAdSenseClientId(value?: string) {
  return /^ca-pub-\d{16}$/.test(value?.trim() ?? "");
}

export function isValidAdSenseSlotId(value?: string) {
  return /^\d+$/.test(value?.trim() ?? "");
}
