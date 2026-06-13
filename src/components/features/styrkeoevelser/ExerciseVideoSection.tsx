import { getYoutubeEmbedId, getYoutubeEmbedUrl } from "./youtube";

type ExerciseVideoSectionProps = {
  videoUrl: string;
  title: string;
};

export const ExerciseVideoSection = ({
  videoUrl,
  title,
}: ExerciseVideoSectionProps) => {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const videoId = getYoutubeEmbedId(videoUrl);

  if (embedUrl && videoId) {
    return (
      <section className="my-10" aria-labelledby="exercise-video-heading">
        <h2
          id="exercise-video-heading"
          className="text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2"
        >
          Video
        </h2>
        <div className="aspect-video w-full max-w-3xl rounded-lg overflow-hidden bg-gray-100 shadow-sm">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="my-10" aria-labelledby="exercise-video-heading">
      <h2
        id="exercise-video-heading"
        className="text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2"
      >
        Video
      </h2>
      <a
        href={videoUrl}
        className="text-logo-blue hover:underline font-medium"
        rel="noopener noreferrer"
        target="_blank"
      >
        Åbn video i nyt vindue
      </a>
    </section>
  );
};
