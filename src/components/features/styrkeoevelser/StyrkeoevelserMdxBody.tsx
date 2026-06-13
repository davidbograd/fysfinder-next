import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MdxProseTable } from "@/components/mdx/MdxProseTable";
import remarkGfm from "remark-gfm";
import rehypeDanishSlug from "@/lib/mdx/rehype-danish-slug";
import { loadLinkConfig } from "lib/internal-linking/config";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";

type StyrkeoevelserMdxBodyProps = {
  source: string;
  currentPagePath: string;
};

const getImageDimension = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

export function StyrkeoevelserMdxBody({
  source,
  currentPagePath,
}: StyrkeoevelserMdxBodyProps) {
  const linkConfig = loadLinkConfig();

  return (
    <div className="prose prose-lg max-w-none text-gray-800">
      <MDXRemote
        source={source}
        components={{
          h2: (props) => (
            <h2
              {...props}
              className="text-2xl font-semibold mb-4 mt-12 text-gray-800 border-b-2 border-gray-200 pb-2"
            />
          ),
          h3: (props) => (
            <h3
              {...props}
              className="text-lg font-semibold mb-1 mt-8 text-gray-800"
            />
          ),
          h4: (props) => (
            <h4 {...props} className="font-semibold mt-2 text-gray-800" />
          ),
          p: (props) => <p {...props} className="text-gray-700 mb-4" />,
          Image: (props) => {
            const { src, alt, width, height, ...rest } = props;
            const normalizedWidth = getImageDimension(width);
            const normalizedHeight = getImageDimension(height);
            const normalizedAlt = alt || "Illustration";

            if (!src) {
              return null;
            }

            if (normalizedWidth && normalizedHeight) {
              return (
                <div className="w-full my-8">
                  <Image
                    src={src}
                    alt={normalizedAlt}
                    width={normalizedWidth}
                    height={normalizedHeight}
                    className="w-full h-auto rounded-lg"
                    sizes="(max-width: 1024px) 100vw, 768px"
                    {...rest}
                  />
                </div>
              );
            }

            return (
              <div className="w-full my-8">
                <img
                  src={typeof src === "string" ? src : ""}
                  alt={normalizedAlt}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </div>
            );
          },
          a: (props) => (
            <a {...props} className="text-logo-blue hover:underline" />
          ),
          ul: (props) => <ul {...props} className="list-disc pl-6 mb-4" />,
          ol: (props) => <ol {...props} className="list-decimal pl-6 mb-4" />,
          li: (props) => <li {...props} className="mb-2" />,
          table: MdxProseTable,
        }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeDanishSlug,
              [rehypeInternalLinks, { linkConfig, currentPagePath }],
            ] as any[],
          },
        }}
      />
    </div>
  );
}
