export {};

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
};

async function getRedirects(): Promise<Redirect[]> {
  const nextConfig = (await import("../../../../next.config.js")).default;
  if (!nextConfig.redirects) {
    throw new Error("next.config.js is missing redirects");
  }
  return nextConfig.redirects();
}

describe("legacy /tilmeld redirect", () => {
  it("permanently redirects /tilmeld to /for-klinikker", async () => {
    const redirects = await getRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/tilmeld",
          destination: "/for-klinikker",
          permanent: true,
        },
      ])
    );
  });
});
