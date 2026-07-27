import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Card, Label } from '@/components/ui';
import { GuidePage } from '@/components/GuidePage';
import { findSession } from '@/data/mentorship';
import { explainPassage } from '@/lib/claudeApi';

/**
 * One seminar session, with the AI guide at the end for questions
 * raised along the way.
 */
export default function SeminarSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = findSession(String(id));

  if (!session) {
    return (
      <GuidePage
        content={{
          title: 'Session not found',
          sections: [{ body: ['This session does not exist. Go back and choose one of the seven.'] }],
        }}
      />
    );
  }

  return <GuidePage content={session.content} footer={<AskGuide sessionTitle={session.title} aim={session.aim} />} />;
}

function AskGuide({ sessionTitle, aim }: { sessionTitle: string; aim: string }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await explainPassage({
        mode: 'ask',
        reference: `Life in the Spirit Seminar — ${sessionTitle}`,
        passage: aim,
        question: q,
      });
      setAnswer(res);
    } catch (e: any) {
      setError(e?.message ?? 'The guide is unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 26 }}>
      <Label style={{ marginBottom: 8 }}>Ask your guide</Label>
      <Card>
        <TextInput
          style={styles.input}
          placeholder="A question from this session…"
          placeholderTextColor={Lumen.colors.muted}
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <Pressable style={[styles.askBtn, busy && { opacity: 0.6 }]} onPress={ask} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#0d1830" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={16} color="#0d1830" />
              <Text style={styles.askText}>Ask</Text>
            </>
          )}
        </Pressable>
        {error && <Text style={styles.error}>{error}</Text>}
        {answer && <Text style={styles.answer}>{answer}</Text>}
        <Text style={styles.disclaimer}>
          An aid to study and prayer — never a replacement for Scripture, the Church, or your pastor.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, minHeight: 60, textAlignVertical: 'top' },
  askBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-end', marginTop: 10, height: 40, paddingHorizontal: 22, borderRadius: 20, backgroundColor: Lumen.colors.accent },
  askText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 14 },
  error: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99', marginTop: 12 },
  answer: { fontFamily: Lumen.fonts.body, fontSize: 15, lineHeight: 23, color: Lumen.colors.text, marginTop: 14 },
  disclaimer: { fontFamily: Lumen.fonts.body, fontSize: 11.5, lineHeight: 17, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 12 },
});
