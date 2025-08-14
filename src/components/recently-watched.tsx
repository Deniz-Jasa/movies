"use client";

import { useEffect, useState } from 'react';
import ShowsCarousel from '@/components/shows-carousel';
import type { Show } from '@/types';
import { useSearchStore } from '@/stores/search';

export default function RecentlyWatched() {
  const [shows, setShows] = useState<Show[]>([]);
  const { query } = useSearchStore();

  useEffect(() => {
    void fetch('/api/history')
      .then((r) => r.json())
      .then((d) => setShows(d.shows ?? []))
      .catch(() => setShows([]));
  }, []);

  // Hide when searching
  if (query && query.length > 0) return null;
  if (!shows.length) return null;
  return <ShowsCarousel title="Recently Watched" shows={shows} />;
}


