-- AlterTable
ALTER TABLE "Section" ADD COLUMN "coverImage" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "coverImage" TEXT,
ADD COLUMN "offersCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "certificateLabel" TEXT;

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reading_courseId_idx" ON "Reading"("courseId");

-- CreateIndex
CREATE INDEX "LectureNote_userId_idx" ON "LectureNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LectureNote_userId_lectureId_key" ON "LectureNote"("userId", "lectureId");

-- CreateIndex
CREATE INDEX "Playback_userId_idx" ON "Playback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Playback_userId_lectureId_key" ON "Playback"("userId", "lectureId");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureNote" ADD CONSTRAINT "LectureNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureNote" ADD CONSTRAINT "LectureNote_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
