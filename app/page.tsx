import { CalendarIcon, HardHatIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-amber-50">
      <main className="container min-h-screen mx-auto px-4 py-16 text-center w-full max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6">
          Connect with Professional
          <span className="text-amber-600"> Handymen</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
          Book trusted handymen for your home or join our network of skilled
          professionals. Simple scheduling, quality work guaranteed.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16">
          <Link
            href="/customer/register"
            className="group bg-white hover:bg-green-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300 cursor-pointer size-[280px]"
            aria-label="Register as a customer to book professional handymen for your home projects"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <CalendarIcon className="w-8 h-8 text-green-600" />
            </div>

            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
              Book a Handyman
            </h3>
            <p className="text-gray-600">
              Schedule professional handymen for your home projects
            </p>
          </Link>

          <Link
            href="/handyman/register"
            className="group bg-white hover:bg-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-amber-300 cursor-pointer size-[280px]"
            aria-label="Register as a handyman to provide professional services to customers in your area"
          >
            <div className="p-4 w-fit mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <HardHatIcon className="w-8 h-8 text-amber-600" />
            </div>

            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
              Join as Handyman
            </h3>
            <p className="text-gray-600">
              Become a handyman and provide professional services for customers
              in your area
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
