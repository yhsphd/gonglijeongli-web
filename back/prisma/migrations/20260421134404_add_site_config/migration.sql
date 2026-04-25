-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "showAbout" BOOLEAN NOT NULL DEFAULT true,
    "showNews" BOOLEAN NOT NULL DEFAULT true,
    "showEvents" BOOLEAN NOT NULL DEFAULT true,
    "showWorks" BOOLEAN NOT NULL DEFAULT true,
    "showGallery" BOOLEAN NOT NULL DEFAULT true
);
