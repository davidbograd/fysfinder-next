import type { ComponentType } from "react";
import { PhysitrackLogo } from "@/components/ui/Icons/PhysitrackLogo";
import { cn } from "@/lib/utils";
import { getYoutubeEmbedUrl } from "./youtube";

const SELF_HOSTED_VIDEO_PATTERN = /\.(mp4|webm)(\?.*)?$/i;

const SELF_HOSTED_MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

/** Logos we are licensed to show beside footage, keyed by `videoAttributionLogo`. */
const ATTRIBUTION_LOGOS: Record<string, ComponentType<{ className?: string }>> =
  {
    physitrack: PhysitrackLogo,
  };

type ExerciseVideoSectionProps = {
  videoUrl: string;
  title: string;
  /** Frame shown before playback; falls back to the browser's first decoded frame. */
  posterUrl?: string;
  /** Rights/credit line for licensed footage, rendered under the player. */
  attribution?: string;
  /** Key into `ATTRIBUTION_LOGOS` for the rights holder's mark. */
  attributionLogo?: string;
  className?: string;
};

const selfHostedMimeType = (videoUrl: string): string | undefined => {
  const extension = SELF_HOSTED_VIDEO_PATTERN.exec(videoUrl)?.[1]?.toLowerCase();
  return extension ? SELF_HOSTED_MIME_TYPES[extension] : undefined;
};

/**
 * The exercise demo video and its rights credit.
 *
 * Deliberately headingless: it renders inside the "Sådan gør du" section and
 * shares that heading, so the footage reads as part of the instructions. The
 * `<video>` carries `title`, which is what names it for assistive tech.
 */
export const ExerciseVideoSection = ({
  videoUrl,
  title,
  posterUrl,
  attribution,
  attributionLogo,
  className,
}: ExerciseVideoSectionProps) => {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const mimeType = selfHostedMimeType(videoUrl);
  const AttributionLogo = attributionLogo
    ? ATTRIBUTION_LOGOS[attributionLogo]
    : undefined;

  return (
    <figure className={cn("m-0", className)}>
      {mimeType ? (
        <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-sm">
          <video
            className="h-auto w-full"
            controls
            loop
            muted
            playsInline
            preload="metadata"
            poster={posterUrl}
            title={title}
            controlsList="nodownload"
            disablePictureInPicture
          >
            <source src={videoUrl} type={mimeType} />
          </video>
        </div>
      ) : embedUrl ? (
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-gray-100 shadow-sm">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <a
          href={videoUrl}
          className="font-medium text-logo-blue hover:underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          Åbn video i nyt vindue
        </a>
      )}

      {AttributionLogo || attribution ? (
        <figcaption className="mt-4 flex flex-col gap-2">
          {AttributionLogo ? (
            <AttributionLogo className="h-5 w-auto self-start text-gray-700" />
          ) : null}
          {attribution ? (
            <p className="text-xs leading-relaxed text-gray-500">
              {attribution}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
};
