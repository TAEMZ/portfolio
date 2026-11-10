import React, { useState, useEffect, useRef, useCallback } from "react";

const DELIMITER_RE = /(\s+|&|-|—)/;

function shuffleTail(tail) {
  const chars = tail.split("");
  const hasMultipleDistinct = new Set(chars).size >= 2;

  for (let attempt = 0; attempt < 4; attempt++) {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = chars[i];
      chars[i] = chars[j];
      chars[j] = tmp;
    }
    const candidate = chars.join("");
    if (!hasMultipleDistinct || candidate !== tail) {
      return candidate;
    }
  }

  // Fallback swap if random shuffles landed on identity
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] !== chars[0]) {
      const tmp = chars[0];
      chars[0] = chars[i];
      chars[i] = tmp;
      break;
    }
  }
  return chars.join("");
}

function scrambleByWords(text, revealedCount) {
  const tokens = text.split(DELIMITER_RE);
  let cursor = 0;

  return tokens
    .map((token) => {
      const tokenStart = cursor;
      cursor += token.length;

      if (!token || DELIMITER_RE.test(token)) {
        return token;
      }

      const lockedInWord = Math.max(
        0,
        Math.min(token.length, revealedCount - tokenStart)
      );
      if (lockedInWord >= token.length - 1) {
        return token;
      }

      const lockedPrefix = token.slice(0, lockedInWord);
      const unrevealedTail = token.slice(lockedInWord);
      return lockedPrefix + shuffleTail(unrevealedTail);
    })
    .join("");
}

export default function ScrambleText({
  text,
  as: Tag = "h2",
  className = "",
  duration = 760,
}) {
  const [displayText, setDisplayText] = useState(text);
  const headingRef = useRef(null);
  const rafRef = useRef(null);
  const wasVisibleRef = useRef(false);

  const runScramble = useCallback(() => {
    if (!text) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayText(text);
      return;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startTime = performance.now();
    let lastGlyphTick = 0;

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * text.length);

      if (progress >= 1) {
        setDisplayText(text);
        rafRef.current = null;
        return;
      }

      if (now - lastGlyphTick >= 46) {
        lastGlyphTick = now;
        setDisplayText(scrambleByWords(text, revealedCount));
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [text, duration]);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    const node = headingRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplayText(text);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!wasVisibleRef.current) {
              wasVisibleRef.current = true;
              runScramble();
            }
          } else {
            wasVisibleRef.current = false;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, runScramble]);

  return (
    <Tag ref={headingRef} className={className} aria-label={text}>
      {displayText}
    </Tag>
  );
}

