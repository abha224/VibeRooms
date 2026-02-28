export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          VibeRooms
        </h1>
        <p className="text-center text-xl mb-12 text-gray-600 dark:text-gray-300">
          Create and join virtual spaces for collaboration and connection
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Create Room</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your own virtual space and invite others to join
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Join Room</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a room code to connect with friends and colleagues
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Explore</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover public rooms and communities
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
