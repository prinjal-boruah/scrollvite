"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f5f2] px-4">
      <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* LEFT – BRAND / VISUAL */}
        <div
          className="hidden md:flex flex-col justify-center px-16 text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(31,41,51,0.65), rgba(31,41,51,0.65)), url('https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1600&q=80')",
          }}
        >
          <h1 className="font-serif text-5xl leading-tight mb-6">
            Your wedding,
            <br />
            beautifully told.
          </h1>

          <p className="text-lg text-gray-200 max-w-md">
            Create elegant, modern wedding invitations that feel personal,
            timeless, and effortless to share.
          </p>

          <div className="mt-12 text-sm tracking-widest text-[#c9a24d]">
            SCROLLVITE
          </div>
        </div>

        {/* RIGHT – LOGIN */}
        <div className="flex flex-col justify-center px-8 sm:px-12 py-14">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl mb-2">
              Welcome to Scrollvite
            </h2>
            <p className="text-gray-500">
              Sign in to continue
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const idToken = credentialResponse.credential;

                const res = await fetch(
                  "http://127.0.0.1:8000/api/auth/google/",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_token: idToken }),
                  }
                );

                const data = await res.json();

                localStorage.setItem("access", data.access);
                localStorage.setItem("user", JSON.stringify(data.user));

                router.push("/categories");
              }}
              onError={() => {
                alert("Login failed. Please try again.");
              }}
            />
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer">
              Privacy Policy
            </span>.
          </p>
        </div>
      </div>
    </main>
  );
}
