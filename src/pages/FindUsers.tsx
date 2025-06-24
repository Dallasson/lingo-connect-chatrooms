
import Header from '@/components/Header';
import UserSearch from '@/components/UserSearch';

const FindUsers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Find Language Partners</h1>
            <p className="text-slate-400">
              Connect with native speakers and language learners from around the world
            </p>
          </div>

          <UserSearch />
        </div>
      </div>
    </div>
  );
};

export default FindUsers;
