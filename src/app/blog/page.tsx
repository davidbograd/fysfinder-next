import { BlogList } from "@/components/features/content/BlogList";
import { getBlogPosts } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface BlogStructuredDataProps {
  posts: BlogPost[];
}

function BlogStructuredData({ posts }: BlogStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "Blog", "CollectionPage"],
    name: "FysFinder Blog",
    description: "Læs de seneste blogindlæg om fysioterapi, sundhed og velvære",
    author: {
      "@type": "Person",
      name: "Joachim Bograd",
      jobTitle: "Fysioterapeut",
      description:
        "Uddannet Bachelor i fysioterapi fra Københavns Professionshøjskole",
      sameAs: ["https://www.linkedin.com/in/joachim-bograd-43b0a120a/"],
      affiliation: {
        "@type": "MedicalOrganization",
        name: "FysFinder",
        url: "https://fysfinder.dk",
      },
    },
    about: {
      "@type": "MedicalSpecialty",
      name: "Fysioterapi",
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Physical Therapy",
      },
    },
    specialty: "Fysioterapi",
    medicalAudience: "Patienter og sundhedsprofessionelle",
    blogPosts: posts.map((post) => ({
      "@type": "BlogPosting",
      name: post.title,
      description: post.description,
      datePublished: post.datePublished,
      url: `https://fysfinder.dk/blog/${post.slug}`,
      author: {
        "@type": "Person",
        name: "Joachim Bograd",
        jobTitle: "Fysioterapeut",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export const metadata = {
  title: "FysFinder Blog",
  description: "Læs de seneste blogindlæg om fysioterapi, sundhed og velvære",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto py-8">
      <BlogStructuredData posts={posts} />
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">FysFinder Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Her finder du spændende artikler om fysioterapi, sundhed og velvære.
          </p>
        </div>
        <BlogList posts={posts} />
      </div>
    </div>
  );
}
