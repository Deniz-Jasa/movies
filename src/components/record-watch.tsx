"use client";

import { useEffect } from 'react';

export default function RecordWatch({ showId, mediaType }: { showId: number; mediaType: string }) {
  useEffect(() => {
    if (!showId || !mediaType) return;
    void fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showId, mediaType }),
    }).catch(() => {});
  }, [showId, mediaType]);
  return null;
}


