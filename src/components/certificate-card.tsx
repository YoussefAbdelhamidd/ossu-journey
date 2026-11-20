export function CertificateCard({
  courseTitle,
  provider,
  label,
  courseUrl,
}: {
  courseTitle: string;
  provider: string | null;
  label: string;
  courseUrl: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <div className="border-b border-border/70 bg-[#0a3f3d] px-5 py-4 text-[#f6f3ea]">
        <p className="text-xs tracking-[0.16em] text-[#d7ebe6] uppercase">Certificate preview</p>
        <p className="mt-1 text-sm text-[#d7ebe6]">
          Original card for this desk — not the provider&apos;s artwork.
        </p>
      </div>
      <div className="p-5">
        <div className="rounded-xl border-2 border-[#d7a15e] bg-[#fff7ea] px-5 py-6 text-center shadow-sm">
          <p className="text-xs tracking-[0.2em] text-[#9c4a32] uppercase">Certificate of completion</p>
          <h3 className="mt-3 font-sans text-2xl font-semibold text-[#0a3f3d]">{courseTitle}</h3>
          {provider ? <p className="mt-2 text-sm text-muted-foreground">{provider}</p> : null}
          <p className="mt-4 text-sm font-medium text-[#0e6b66]">{label}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Finish the official course to earn the real credential.
          </p>
        </div>
        <a
          href={courseUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm text-[#0e6b66] underline-offset-4 hover:underline"
        >
          Open the official course page
        </a>
      </div>
    </section>
  );
}
