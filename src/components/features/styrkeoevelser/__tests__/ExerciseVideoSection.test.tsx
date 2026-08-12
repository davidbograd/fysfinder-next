import { render, screen } from "@testing-library/react";
import { ExerciseVideoSection } from "@/components/features/styrkeoevelser/ExerciseVideoSection";

const MP4_URL = "https://cdn.example.com/exercise-videos/squat.mp4";

describe("ExerciseVideoSection", () => {
  it("plays self-hosted files in a native player instead of an iframe", () => {
    const { container } = render(
      <ExerciseVideoSection videoUrl={MP4_URL} title="Squat" />
    );

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();

    expect(container.querySelector("source")).toHaveAttribute("src", MP4_URL);
    expect(container.querySelector("source")).toHaveAttribute(
      "type",
      "video/mp4"
    );
  });

  it("loops silently inline so a demo clip needs no sound or fullscreen", () => {
    const { container } = render(
      <ExerciseVideoSection videoUrl={MP4_URL} title="Squat" />
    );

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "metadata");
    expect((video as HTMLVideoElement).muted).toBe(true);
  });

  it("hides the download and picture-in-picture controls on licensed footage", () => {
    const { container } = render(
      <ExerciseVideoSection videoUrl={MP4_URL} title="Squat" />
    );

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("controlslist", "nodownload");
    expect(video).toHaveAttribute("disablepictureinpicture");
  });

  it("renders no heading, since it sits inside the how-to section", () => {
    render(<ExerciseVideoSection videoUrl={MP4_URL} title="Squat" />);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("names the player from its title so it is reachable without a heading", () => {
    const { container } = render(
      <ExerciseVideoSection
        videoUrl={MP4_URL}
        title="Squat – videodemonstration"
      />
    );

    expect(container.querySelector("video")).toHaveAttribute(
      "title",
      "Squat – videodemonstration"
    );
  });

  it("renders the rights notice under the player when one is given", () => {
    render(
      <ExerciseVideoSection
        videoUrl={MP4_URL}
        title="Squat"
        attribution="Videoen tilhører Physitrack og er beskyttet af ophavsret."
      />
    );

    expect(
      screen.getByText(/Videoen tilhører Physitrack/)
    ).toBeInTheDocument();
  });

  it("omits the rights notice when there is nothing to credit", () => {
    const { container } = render(
      <ExerciseVideoSection videoUrl={MP4_URL} title="Squat" />
    );

    expect(container.querySelector("p")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the rights holder's logo when the exercise names one", () => {
    render(
      <ExerciseVideoSection
        videoUrl={MP4_URL}
        title="Squat"
        attributionLogo="physitrack"
      />
    );

    expect(screen.getByRole("img", { name: "Physitrack" })).toBeInTheDocument();
  });

  it("groups the credit with the player as a figure caption", () => {
    const { container } = render(
      <ExerciseVideoSection
        videoUrl={MP4_URL}
        title="Squat"
        attributionLogo="physitrack"
        attribution="Videoen tilhører Physitrack."
      />
    );

    const caption = container.querySelector("figure > figcaption");
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent("Videoen tilhører Physitrack.");
    expect(caption?.querySelector('svg[aria-label="Physitrack"]')).toBeTruthy();
  });

  it("ignores an unknown logo key rather than crashing the page", () => {
    render(
      <ExerciseVideoSection
        videoUrl={MP4_URL}
        title="Squat"
        attributionLogo="not-a-partner"
        attribution="Alle rettigheder forbeholdes."
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText("Alle rettigheder forbeholdes.")
    ).toBeInTheDocument();
  });

  it("still embeds YouTube URLs as an iframe", () => {
    const { container } = render(
      <ExerciseVideoSection
        videoUrl="https://www.youtube.com/watch?v=abc123"
        title="Squat"
      />
    );

    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123"
    );
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("falls back to a plain link for URLs it cannot play", () => {
    render(
      <ExerciseVideoSection
        videoUrl="https://drive.google.com/file/d/xyz/view"
        title="Squat"
      />
    );

    expect(
      screen.getByRole("link", { name: "Åbn video i nyt vindue" })
    ).toHaveAttribute("href", "https://drive.google.com/file/d/xyz/view");
  });
});
