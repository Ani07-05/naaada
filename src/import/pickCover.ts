// Pick a custom cover image for a track and persist it into app storage so the
// reference survives the picker's temporary cache being cleared.
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export async function pickCoverImage(songId: string): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });
  if (res.canceled || !res.assets?.length) return null;
  const src = res.assets[0].uri;

  // Web has no documentDirectory — the picked object URL is used directly.
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return src;

  const dir = docDir + 'covers/';
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch {}
  const ext = (src.split('?')[0].split('.').pop() || 'jpg').slice(0, 4);
  const dest = `${dir}${songId}-${Date.now()}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: src, to: dest });
    return dest;
  } catch {
    return src;
  }
}
