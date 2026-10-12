"use client";

import { useEffect } from "react";
import { useAudio, type PageAudioConfig } from "./AudioProvider";

/** Drop one of these in every page. It tells the sound system which song and pen setting this page uses. */
export function PageAudio({ song, volume, scribble }: PageAudioConfig) {
  const { setPage } = useAudio();
  useEffect(() => { setPage({ song, volume, scribble }); }, [song, volume, scribble, setPage]);
  return null;
}
