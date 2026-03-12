import { useAuthStore } from '@/features/auth/store/auth.store'

export const DashboardPage = () => {
  const { currentRole } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-cyan-700 mb-4">Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Welcome to the dashboard! Here you can manage your settings and view statistics.
        </p>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Your Role:</span>
          <span className="text-cyan-700 font-semibold">{currentRole ?? 'Guest'}</span>
        </div>
      </div>
    </div>
  )
}