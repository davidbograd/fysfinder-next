type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
};

async function getRedirects(): Promise<Redirect[]> {
  const nextConfig = (await import("../../../../../../next.config.js")).default;
  if (!nextConfig.redirects) {
    throw new Error("next.config.js is missing redirects");
  }
  return nextConfig.redirects();
}

describe("legacy online location redirects", () => {
  it("permanently redirects the old online pages to the Danmark online filter", async () => {
    const redirects = await getRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/find/fysioterapeut/online",
          destination: "/find/fysioterapeut/danmark?online=true",
          permanent: true,
        },
        {
          source: "/find/fysioterapeut/online/:specialty",
          destination: "/find/fysioterapeut/danmark/:specialty?online=true",
          permanent: true,
        },
      ])
    );
  });
});
