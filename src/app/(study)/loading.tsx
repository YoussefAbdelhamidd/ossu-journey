export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-[#e7dccb]" />
      <div className="h-36 animate-pulse rounded-2xl bg-[#efe4d2]" />
      <div className="h-24 animate-pulse rounded-2xl bg-[#efe4d2]" />
      <p className="text-sm text-muted-foreground">Loading your place in the curriculum…</p>
    </div>
  );
}
