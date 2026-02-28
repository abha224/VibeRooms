import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white">
      <h1 className="text-6xl font-light serif italic mb-4">Lost</h1>
      <p className="text-zinc-500 mb-8 font-light">
        This room doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500"
      >
        Return to Silence
      </Link>
    </div>
  );
}
