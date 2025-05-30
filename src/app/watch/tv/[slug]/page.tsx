import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import Link from 'next/link';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  return <>
    <Link
      href="/home"
      className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white text-xl rounded-full hover:bg-black/70"
    >
      ✕
    </Link>

    <EmbedPlayer url={`https://vidsrc.cc/v2/embed/tv/${id}`} />
  </>;
}
