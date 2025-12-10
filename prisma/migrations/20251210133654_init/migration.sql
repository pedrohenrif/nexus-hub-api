-- CreateTable
CREATE TABLE "_ProjectToServerEnvironment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToServerEnvironment_AB_unique" ON "_ProjectToServerEnvironment"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToServerEnvironment_B_index" ON "_ProjectToServerEnvironment"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToServerEnvironment" ADD CONSTRAINT "_ProjectToServerEnvironment_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToServerEnvironment" ADD CONSTRAINT "_ProjectToServerEnvironment_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
