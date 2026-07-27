import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { DEFAULT_VERSION, findVersion, VERSIONS, Version } from '@/data/versions';
import { getPref, setPref } from '@/lib/storage';

interface VersionState {
  versionId: string;
  version: Version;
  setVersion: (id: string) => void;
}

const Ctx = createContext<VersionState | null>(null);

export function VersionProvider({ children }: { children: ReactNode }) {
  const [versionId, setVersionId] = useState(DEFAULT_VERSION);

  // Remember the reader's chosen version between sessions.
  useEffect(() => {
    getPref('version').then((v) => {
      if (v && VERSIONS.some((ver) => ver.id === v)) setVersionId(v);
    });
  }, []);

  const value = useMemo<VersionState>(
    () => ({
      versionId,
      version: findVersion(versionId),
      setVersion: (id: string) => {
        setVersionId(id);
        setPref('version', id);
      },
    }),
    [versionId]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVersion(): VersionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVersion must be used within VersionProvider');
  return ctx;
}
