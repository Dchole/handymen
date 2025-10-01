import { LoaderIcon } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoaderIcon className="h-6 w-6 animate-spin text-gray-400" />
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
