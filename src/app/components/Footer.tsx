import SiteLogo from "./Icons/SiteLogo";

export default function Footer() {
  return (
    <footer className="bg-white py-4 mt-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <SiteLogo />
        <p className="text-gray-600 text-sm">Made in Copenhagen</p>
      </div>
    </footer>
  );
}
