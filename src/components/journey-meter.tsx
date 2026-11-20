import { formatHours, formatPercent } from "@/lib/progress";

export function JourneyMeter({
  percent,
  completedHours,
  totalHours,
  midpointTitle,
  hoursUntilMidpoint,
  pastMidpoint,
}: {
  percent: number;
  completedHours: number;
  totalHours: number;
  midpointTitle: string | null;
  hoursUntilMidpoint: number;
  pastMidpoint: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-sans text-5xl leading-tight font-semibold text-[#0a3f3d] tabular-nums">
            {formatPercent(percent)}%
          </p>
          <p className="mt-2 text-sm text-muted-foreground">of the required OSSU track</p>
        </div>
        <p className="text-right text-sm text-muted-foreground">
          {formatHours(completedHours)} of {formatHours(totalHours)}
        </p>
      </div>
      <div className="relative mt-5 h-3 rounded-full bg-[#e7dccb]">
        <div
          className="h-full rounded-full bg-[#0e6b66]"
          style={{ width: `${clamped}%` }}
        />
        <div
          className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-[#9c4a32]"
          style={{ left: "50%" }}
          title="Curriculum midpoint"
        />
        <div
          className="absolute -top-1 size-2.5 -translate-x-1/2 rounded-full border-2 border-[#fffaf3] bg-[#0a3f3d]"
          style={{ left: `${clamped}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 text-xs text-muted-foreground">
        <span>Start</span>
        <span className="text-center text-[#9c4a32]">
          Midpoint
          <span className="mt-0.5 block text-[11px] text-[#9c4a32]">US remote applications</span>
        </span>
        <span className="text-right">Track done</span>
      </div>
      {midpointTitle ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pastMidpoint
            ? `Past the midpoint · `
            : `${formatHours(hoursUntilMidpoint)} to midpoint · `}
          lands in <span className="font-medium text-foreground">{midpointTitle}</span>
        </p>
      ) : null}
    </div>
  );
}
