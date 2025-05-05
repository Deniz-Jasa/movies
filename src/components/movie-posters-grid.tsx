// components/movie-posters-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MovieService from "@/services/MovieService";
import Image from "next/image";
import { MediaType, type Show } from "@/types";
import { RequestType } from "@/enums/request-type";

export default function MoviePostersGrid() {
  const [posters, setPosters] = useState<Show[]>([]);

  useEffect(() => {
    async function fetchPosters() {
      try {
        const { data } = await MovieService.executeRequest({
          requestType: RequestType.POPULAR,
          mediaType: MediaType.MOVIE,
          page: 1,
        });
        if (data?.results) {
          setPosters(data.results.slice(0, 15));
        }
      } catch (err) {
        console.error("Error fetching posters:", err);
      }
    }
    fetchPosters();
  }, []);

  const columnOffsets = [60, 0, 30];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="grid grid-cols-3 gap-8 px-6 pb-6 -mt-[180px]">
        {posters.map((poster, i) => {
          const col = i % 3;
          const yOffset = columnOffsets[col];

          return (
            <motion.div
              key={poster.id}
              className="relative w-full aspect-[2/3] rounded-md overflow-hidden"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: yOffset }}
              transition={{
                delay: i * 0.03,
                type: "spring",
                stiffness: 120,
                damping: 20,
              }}
              whileHover={{ scale: 1.05, zIndex: 1 }}
            >
              <Image
                src={`https://image.tmdb.org/t/p/w500${poster.poster_path}`}
                alt={poster.title ?? ""}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
