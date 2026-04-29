import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { SkillCard } from '@/components/dashboard/SkillCard';
import { MOCK_LISTINGS } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          Marketplace
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Browse skill listings from fellow students and find your next swap
        </p>
      </div>

      {/* Stats */}
      <StatsOverview />

      {/* Listings grid */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">
          Available Swaps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MOCK_LISTINGS.map((listing) => (
            <SkillCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
