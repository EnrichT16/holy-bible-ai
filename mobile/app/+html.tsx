import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * The HTML shell for every statically rendered page (web only).
 * Sets the document title, metadata, and the lapis-navy background so
 * there is never a white flash while the app loads. Carries the web
 * accessibility groundwork: a skip-to-content link, a visible keyboard
 * focus outline in Lumen gold, and stilled motion for anyone whose
 * device asks for reduced motion.
 */

const A11Y_CSS = `
body{background-color:#0d1830}
:focus{outline:none}
:focus-visible{outline:2px solid #f6e4a0;outline-offset:2px;border-radius:4px}
.hb-skip{position:absolute;left:-9999px;top:0;z-index:9999;background:#f6e4a0;color:#0d1830;
  padding:10px 18px;border-radius:0 0 8px 0;font-family:Georgia,serif;font-size:16px;text-decoration:none}
.hb-skip:focus{left:0}
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;
    transition-duration:0.01ms !important;scroll-behavior:auto !important}
}
`;

const SKIP_SCRIPT = `
document.addEventListener('DOMContentLoaded',function(){
  var link=document.getElementById('hb-skip-link');
  if(!link)return;
  link.addEventListener('click',function(e){
    e.preventDefault();
    var main=document.getElementById('main-content');
    if(main){main.setAttribute('tabindex','-1');main.focus();main.scrollIntoView();}
  });
});
`;

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
        <style dangerouslySetInnerHTML={{ __html: A11Y_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      </head>
      <body>
        <a id="hb-skip-link" className="hb-skip" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
