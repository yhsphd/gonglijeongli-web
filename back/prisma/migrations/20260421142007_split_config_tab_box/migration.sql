/*
  Warnings:

  - You are about to drop the column `showAbout` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `showEvents` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `showGallery` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `showNews` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `showWorks` on the `SiteConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "showAboutTab" BOOLEAN NOT NULL DEFAULT true,
    "showNewsTab" BOOLEAN NOT NULL DEFAULT true,
    "showEventsTab" BOOLEAN NOT NULL DEFAULT true,
    "showWorksTab" BOOLEAN NOT NULL DEFAULT true,
    "showGalleryTab" BOOLEAN NOT NULL DEFAULT true,
    "showAboutBox" BOOLEAN NOT NULL DEFAULT true,
    "showNewsBox" BOOLEAN NOT NULL DEFAULT true,
    "showEventsBox" BOOLEAN NOT NULL DEFAULT true,
    "showWorksBox" BOOLEAN NOT NULL DEFAULT true,
    "showGalleryBox" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_SiteConfig" ("id") SELECT "id" FROM "SiteConfig";
DROP TABLE "SiteConfig";
ALTER TABLE "new_SiteConfig" RENAME TO "SiteConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
