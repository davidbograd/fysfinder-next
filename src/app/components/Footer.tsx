import SiteLogo from "./Icons/SiteLogo";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-4 mt-auto border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <SiteLogo />
        <p className="text-sm text-gray-600">Made in Copenhagen</p>
      </div>
    </footer>
  );
};

export default Footer;
