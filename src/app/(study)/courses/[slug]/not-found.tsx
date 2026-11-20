import Link from "next/link";

export default function CourseNotFound() {
  return (
    <div>
      <h1 className="text-3xl text-[#0a3f3d]">That course is not in the seed</h1>
      <Link href="/curriculum" className="mt-3 inline-block text-sm text-[#0e6b66] underline">
        Back to the curriculum
      </Link>
    </div>
  );
}
