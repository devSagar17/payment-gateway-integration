import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-md text-center text-white/90">
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <p className="text-lg mb-6">Oops! Page not found</p>
        <a
          href="/"
          className="underline decoration-violet-500 underline-offset-4 hover:text-white"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
