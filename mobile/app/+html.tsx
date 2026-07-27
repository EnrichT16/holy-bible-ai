import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * The HTML shell for every statically rendered page (web only).
 * Sets the document title, metadata, and the lapis-navy background so
 * there is never a white flash while the app loads.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Holy Bible · AI Assisted</title>
        <meta
          name="description"
          content="A reverent, offline-first Bible and prayer app. Six translations, a guided Rosary, read-aloud, and an AI study companion — free forever."
        />
        <meta name="theme-color" content="#0d1830" />
        <link rel="icon" type="image/svg+xml" href={`${process.env.EXPO_BASE_URL ?? ''}/favicon.svg`} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background-color:#0d1830}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
