import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="flex justify-start p-2 px-4 border-b shadow">
      <div>
        <Link href="/" className="font-semibold text-lg">
          Chatbot
        </Link>
      </div>
    </nav>
  );
}
