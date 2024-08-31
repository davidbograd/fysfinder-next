import React from "react";

interface GoogleMapProps {
  address: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
  const encodedAddress = encodeURIComponent(address);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing");
    return <div>Map unavailable</div>;
  }

  return (
    <iframe
      width="100%"
      height="450"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`}
    ></iframe>
  );
};

export default GoogleMap;
