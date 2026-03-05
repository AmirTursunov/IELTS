import { User } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  setShowAuthModal: (show: boolean) => void;
}

const AuthModal = ({ setShowAuthModal }: AuthModalProps) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-[#9C74FF]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Authentication Required
            </h3>
            <p className="text-gray-600 mb-6">
              You need to sign in or create an account to take this test.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <Link
                href="/sign-in"
                className="flex-1 px-6 py-3 bg-linear-to-r  from-[#9C74FF] to-[#C18CFF]
  hover:from-[#8B63E6] hover:to-[#A67FFF]
  transition-colors duration-300 text-white rounded-xl font-semibold  shadow-md text-center"
              >
                Sign In
              </Link>
            </div>
            <Link
              href="/sign-up"
              className="block mt-3 text-sm text-[#9C74FF] hover:text-[#8B63E6] font-semibold"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
