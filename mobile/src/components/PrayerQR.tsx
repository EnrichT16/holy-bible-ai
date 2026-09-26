import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import qrcode from 'qrcode-generator';

/**
 * A QR code drawn with plain views, so it works identically on web and
 * native with no imaging library. Ink on ivory, like everything else in
 * the app — scanners ask only that the modules be darker than the page.
 * The `label` is what a screen reader speaks in place of the pattern.
 */
export function PrayerQR({
  value,
  label,
  size = 240,
}: {
  value: string;
  label: string;
  size?: number;
}) {
  const matrix = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const rows: boolean[][] = [];
    for (let r = 0; r < n; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < n; c++) row.push(qr.isDark(r, c));
      rows.push(row);
    }
    return rows;
  }, [value]);

  const quiet = 12; // the quiet zone scanners expect around the code
  const cell = (size - quiet * 2) / matrix.length;

  return (
    <View
      style={[styles.sheet, { width: size, height: size, padding: quiet }]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {matrix.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }} aria-hidden>
          {row.map((dark, c) => (
            <View
              key={c}
              style={{
                width: cell,
                height: cell,
                backgroundColor: dark ? '#0d1830' : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#f1e8d2', borderRadius: 12 },
});
