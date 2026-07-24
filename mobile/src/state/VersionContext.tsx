import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { DEFAULT_VERSION, findVersion, Version } from '@/data/versions';

interface VersionState {
  versionId: string;
  version: Version;
  setVersion: (id: string) => void;
}

const Ctx = createContext<VersionState | null>(null);

export function VersionProvider({ children }: { children: ReactNode }) {
  const [versionId, setVersionId] = useState(DEFAULT_VERSION);
  const value = useMemo<VersionState>(
    () => ({ versionId, version: findVersion(versionId), setVersion: setVersionId }),
    [versionId]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVersion(): VersionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVersion must be used within VersionProvider');
  return ctx;
}
