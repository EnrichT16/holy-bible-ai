import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { useAccount } from '@/state/AccountContext';
import { sendRecoveryEmail } from '@/lib/auth';
import { shareText } from '@/lib/share';
import { announce } from '@/lib/a11y';
import { rpc } from '@/lib/supabase';

/** Read a prayer ID character by character, as a screen reader should. */
const spellPrayerId = (id: string) => id.split('').map((ch) => (ch === '-' ? 'dash' : ch)).join(' ');

/**
 * Account — the door to the Prayer Circle, and nothing more.
 *
 * Scripture, the Rosary, the Chaplet, the Library and every reading are
 * free and open with no account at all. A person signs in here only so
 * that their friends can find them by their prayer ID.
 */
export default function Account() {
  const router = useRouter();
  const { status, profile, session, available, signIn, signUp, signOut, setDisplayName } = useAccount();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} aria-hidden />
        </Pressable>
        <Text style={styles.headerTitle} aria-hidden>App</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title} accessibilityRole="header" aria-level={1}>Your account</Text>

          {!available ? (
            <Card style={{ marginTop: 18 }}>
              <Text style={styles.quietTitle}>Accounts are not switched on yet</Text>
              <Text style={styles.quiet}>
                This build carries no account keys. Everything else — Scripture, the Rosary,
                the Chaplet, the Library — works exactly as it does without one.
              </Text>
            </Card>
          ) : status === 'loading' ? (
            <Card style={{ marginTop: 18, alignItems: 'center' }}>
              <ActivityIndicator color={Lumen.colors.accent} />
            </Card>
          ) : status === 'signed-in' ? (
            <SignedIn
              email={session?.email ?? ''}
              name={profile?.display_name ?? ''}
              prayerId={profile?.prayer_id ?? ''}
              onRename={setDisplayName}
              onSignOut={signOut}
              onOpenCircle={() => router.push('/circle')}
            />
          ) : (
            <SignedOut onSignIn={signIn} onSignUp={signUp} />
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ── Signed in ───────────────────────────────────────────────────────

function SignedIn({
  email,
  name,
  prayerId,
  onRename,
  onSignOut,
  onOpenCircle,
}: {
  email: string;
  name: string;
  prayerId: string;
  onRename: (name: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenCircle: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<'idle' | 'confirm' | 'busy'>('idle');

  const deleteAccount = async () => {
    setLeaving('busy');
    setProblem(null);
    try {
      await rpc<null>('delete_account');
      announce('Your account is deleted. Nothing of it remains. The Word is still yours, freely.');
      await onSignOut();
    } catch (e) {
      setLeaving('idle');
      setProblem(
        e instanceof Error && e.message
          ? e.message
          : 'The account could not be deleted just now. Please try again.',
      );
    }
  };

  // Say the prayer ID once when it appears, and every note or problem.
  useEffect(() => {
    if (prayerId) announce(`Signed in. Your prayer ID is ${spellPrayerId(prayerId)}.`);
  }, [prayerId]);
  useEffect(() => {
    if (note) announce(note);
  }, [note]);
  useEffect(() => {
    if (problem) announce(problem);
  }, [problem]);

  const save = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await onRename(draft);
      setEditing(false);
      setNote('Your name is saved.');
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const outcome = await shareText(
      `Pray with me on Holy Bible · AI Assisted. My prayer ID is ${prayerId}.`,
    );
    setNote(
      outcome === 'copied'
        ? 'Your invitation is on the clipboard.'
        : outcome === 'shared'
          ? null
          : `Read it to them as it stands: ${prayerId}`,
    );
  };

  return (
    <>
      <Label style={styles.sectionLabel}>Your prayer ID</Label>
      <Card>
        <Text
          style={styles.prayerId}
          accessibilityLabel={prayerId ? `Your prayer ID: ${spellPrayerId(prayerId)}` : 'Your prayer ID is still being made'}
        >
          {prayerId || '—'}
        </Text>
        <Text style={styles.quiet}>
          This is how a friend finds you. Give it to the people you want in your circle —
          it reveals nothing else about you, and only those you accept can see your name.
        </Text>
        <Pressable
          style={styles.primary}
          onPress={share}
          disabled={!prayerId}
          accessibilityRole="button"
          accessibilityLabel="Share your prayer ID"
          accessibilityState={{ disabled: !prayerId }}
        >
          <Ionicons name="share-outline" size={17} color="#0d1830" aria-hidden />
          <Text style={styles.primaryText}>Share your prayer ID</Text>
        </Pressable>
      </Card>

      <Label style={styles.sectionLabel}>Who you are</Label>
      <Card>
        <Text style={styles.fieldLabel}>Name your circle sees</Text>
        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Anna"
              placeholderTextColor={'rgba(155,176,208,0.8)'}
              autoFocus
              accessibilityLabel="The name your circle sees"
            />
            <View style={styles.rowButtons}>
              <Pressable style={[styles.primary, styles.grow]} onPress={save} disabled={busy} accessibilityRole="button" accessibilityLabel="Save your name">
                {busy ? (
                  <ActivityIndicator color="#0d1830" />
                ) : (
                  <Text style={styles.primaryText}>Save</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.secondary, styles.grow]}
                onPress={() => {
                  setDraft(name);
                  setEditing(false);
                  setProblem(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel renaming"
              >
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            style={styles.nameRow}
            onPress={() => {
              setDraft(name);
              setEditing(true);
              setNote(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Your name is ${name || 'A friend in Christ'}`}
            accessibilityHint="Change the name your circle sees"
          >
            <Text style={styles.name}>{name || 'A friend in Christ'}</Text>
            <Ionicons name="create-outline" size={18} color={Lumen.colors.accent} aria-hidden />
          </Pressable>
        )}
        <Text style={styles.emailLine}>{email}</Text>
        {note && <Text style={styles.note}>{note}</Text>}
        {problem && <Text style={styles.problem}>{problem}</Text>}
      </Card>

      <Pressable
        onPress={onOpenCircle}
        accessibilityRole="button"
        accessibilityLabel="Your Prayer Circle. The friends you pray with, and their intentions"
      >
        <Card style={[styles.linkRow, { marginTop: 22 }]}>
          <Ionicons name="people-outline" size={22} color={Lumen.colors.accent} aria-hidden />
          <View style={{ flex: 1 }}>
            <Text style={styles.linkTitle}>Your Prayer Circle</Text>
            <Text style={styles.linkSub}>The friends you pray with, and their intentions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} aria-hidden />
        </Card>
      </Pressable>

      <Pressable style={[styles.secondary, { marginTop: 22 }]} onPress={onSignOut} accessibilityRole="button" accessibilityLabel="Sign out">
        <Ionicons name="log-out-outline" size={17} color={Lumen.colors.muted} aria-hidden />
        <Text style={styles.secondaryText}>Sign out</Text>
      </Pressable>

      {leaving === 'idle' ? (
        <Pressable
          style={styles.deleteLink}
          onPress={() => setLeaving('confirm')}
          accessibilityRole="button"
          accessibilityLabel="Delete your account"
          accessibilityHint="Shows a confirmation before anything is removed"
        >
          <Text style={styles.deleteLinkText}>Delete your account</Text>
        </Pressable>
      ) : (
        <Card style={{ marginTop: 18 }}>
          <Text style={styles.quiet}>
            This erases your account wholly: your prayer ID, your circle ties, your
            intentions, and your call records. Your friends keep nothing of you but
            memory. It cannot be undone. The Word itself remains free — no account is
            ever needed to read or to pray.
          </Text>
          <View style={styles.rowButtons}>
            <Pressable
              style={[styles.deleteConfirm, styles.grow]}
              onPress={deleteAccount}
              disabled={leaving === 'busy'}
              accessibilityRole="button"
              accessibilityLabel="Yes, delete my account for good"
              accessibilityState={{ disabled: leaving === 'busy' }}
            >
              {leaving === 'busy' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteConfirmText}>Delete for good</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.secondary, styles.grow]}
              onPress={() => setLeaving('idle')}
              accessibilityRole="button"
              accessibilityLabel="Keep your account"
            >
              <Text style={styles.secondaryText}>Keep it</Text>
            </Pressable>
          </View>
        </Card>
      )}

      <Text style={styles.creed}>
        Your account is only ever a door to your circle. The Word itself needs no key.
      </Text>
    </>
  );
}

// ── Signed out ──────────────────────────────────────────────────────

function SignedOut({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
}) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (note) announce(note);
  }, [note]);
  useEffect(() => {
    if (problem) announce(problem);
  }, [problem]);

  const creating = mode === 'up';
  const ready =
    !busy && email.trim().length > 3 && password.length >= 6 && (!creating || name.trim().length > 0);

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    setNote(null);
    try {
      if (creating) {
        const { needsConfirmation } = await onSignUp(email, password, name);
        if (needsConfirmation) {
          setNote(
            'Welcome. Confirm your email using the link we have just sent, then come back and sign in.',
          );
        }
      } else {
        await onSignIn(email, password);
      }
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const recover = async () => {
    if (!email.trim()) {
      setProblem('Give your email first, and we will send the link there.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await sendRecoveryEmail(email);
      setNote('A link to set a new password is on its way to your inbox.');
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Text style={styles.subtitle}>
        An account is never needed to read Scripture or to pray. It exists for one thing:
        so the friends you pray with can find you.
      </Text>

      <View style={styles.switcher}>
        <Pressable
          style={[styles.switchTab, !creating && styles.switchTabActive]}
          onPress={() => {
            setMode('in');
            setProblem(null);
            setNote(null);
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to an existing account"
          accessibilityState={{ selected: !creating }}
        >
          <Text style={[styles.switchText, !creating && styles.switchTextActive]}>Sign in</Text>
        </Pressable>
        <Pressable
          style={[styles.switchTab, creating && styles.switchTabActive]}
          onPress={() => {
            setMode('up');
            setProblem(null);
            setNote(null);
          }}
          accessibilityRole="button"
          accessibilityLabel="Create a new account"
          accessibilityState={{ selected: creating }}
        >
          <Text style={[styles.switchText, creating && styles.switchTextActive]}>Create an account</Text>
        </Pressable>
      </View>

      <Card>
        {creating && (
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Anna"
            autoCapitalize="words"
          />
        )}
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.org"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
              value={password}
              onChangeText={setPassword}
              placeholder="At least six characters"
              placeholderTextColor={'rgba(155,176,208,0.8)'}
              secureTextEntry={!reveal}
              autoCapitalize="none"
              accessibilityLabel="Password, at least six characters"
            />
            <Pressable
              onPress={() => setReveal((r) => !r)}
              hitSlop={10}
              style={{ paddingHorizontal: 10 }}
              accessibilityRole="button"
              accessibilityLabel={reveal ? 'Hide the password' : 'Show the password'}
            >
              <Ionicons
                name={reveal ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={Lumen.colors.muted}
                aria-hidden
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.primary, !ready && { opacity: 0.45 }]}
          disabled={!ready}
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel={creating ? 'Create my account' : 'Sign in'}
          accessibilityState={{ disabled: !ready }}
        >
          {busy ? (
            <ActivityIndicator color="#0d1830" />
          ) : (
            <>
              <Ionicons name={creating ? 'person-add-outline' : 'log-in-outline'} size={17} color="#0d1830" aria-hidden />
              <Text style={styles.primaryText}>{creating ? 'Create my account' : 'Sign in'}</Text>
            </>
          )}
        </Pressable>

        {!creating && (
          <Pressable
            onPress={recover}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="I have forgotten my password"
            accessibilityHint="Sends a link to set a new password to your email"
          >
            <Text style={styles.forgot}>I have forgotten my password</Text>
          </Pressable>
        )}

        {note && <Text style={styles.note}>{note}</Text>}
        {problem && <Text style={styles.problem}>{problem}</Text>}
      </Card>

      <Text style={styles.creed}>
        We keep only your name, your email, and the circle you build. Nothing you read or
        pray is recorded.
      </Text>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={'rgba(155,176,208,0.8)'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted },
  body: { paddingHorizontal: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 6 },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  sectionLabel: { marginTop: 24, marginBottom: 10 },
  switcher: { flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 14 },
  switchTab: { flex: 1, paddingVertical: 9, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder, alignItems: 'center' },
  switchTabActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  switchText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.muted },
  switchTextActive: { color: '#0d1830' },
  fieldLabel: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Lumen.colors.accent, marginBottom: 6 },
  input: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, backgroundColor: 'rgba(255,255,255,0.03)' },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent, marginTop: 4 },
  primaryText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  secondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 24, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  secondaryText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 15 },
  rowButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  grow: { flex: 1 },
  prayerId: { fontFamily: Lumen.fonts.label, fontSize: 24, letterSpacing: 3, color: Lumen.colors.bright, textAlign: 'center', marginBottom: 12 },
  quietTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text, marginBottom: 6 },
  quiet: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted },
  deleteLink: { alignSelf: 'center', minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 6 },
  deleteLinkText: { fontFamily: Lumen.fonts.body, fontSize: 13, color: 'rgba(221,153,153,0.9)' },
  deleteConfirm: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 24, backgroundColor: '#a33' },
  deleteConfirmText: { fontFamily: Lumen.fonts.bodyBold, color: '#fff', fontSize: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.text },
  emailLine: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 10 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  linkTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  linkSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  forgot: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.accent2, textAlign: 'center', marginTop: 14 },
  note: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, marginTop: 12 },
  problem: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99', marginTop: 12 },
  creed: { fontFamily: Lumen.fonts.body, fontStyle: 'italic', fontSize: 12, lineHeight: 19, color: Lumen.colors.muted, textAlign: 'center', marginTop: 24 },
});
