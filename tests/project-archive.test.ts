import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  buildTranslatedArchivePath,
  createUniqueArchivePaths,
  expandProjectUploadSelection
} from "@/lib/uploads/project-archive";

test("keeps the original folder structure when building translated archive paths", () => {
  assert.equal(
    buildTranslatedArchivePath("marketing/homepage/messages.xliff", "messages.de.xliff"),
    "marketing/homepage/messages.de.xliff"
  );
  assert.equal(
    buildTranslatedArchivePath("messages.xliff", "messages.de.xliff"),
    "messages.de.xliff"
  );
});

test("adds unique suffixes when translated archive entries would collide", () => {
  assert.deepEqual(
    createUniqueArchivePaths([
      {
        preferredPath: "bundle.de.xliff",
        sourcePath: "checkout/messages.xliff"
      },
      {
        preferredPath: "bundle.de.xliff",
        sourcePath: "account/messages.xliff"
      },
      {
        preferredPath: "bundle.de.xliff",
        sourcePath: "messages.xliff"
      }
    ]),
    [
      "bundle.de.xliff",
      "bundle.de-messages.xliff",
      "bundle.de-messages-2.xliff"
    ]
  );
});

test("extracts supported files from zip uploads and ignores system entries", async () => {
  const zip = new JSZip();
  zip.file("ios/app.xliff", "<xliff version=\"1.2\"></xliff>");
  zip.file("android/strings.resx", "<root />");
  zip.file("__MACOSX/._app.xliff", "ignored");
  zip.file("notes.md", "ignored");

  const content = await zip.generateAsync({ type: "uint8array" });
  const archiveBuffer = new ArrayBuffer(content.byteLength);
  new Uint8Array(archiveBuffer).set(content);
  const archiveFile = new File([archiveBuffer], "bundle.zip", {
    type: "application/zip",
    lastModified: Date.now()
  });

  const result = await expandProjectUploadSelection([archiveFile]);

  assert.equal(result.files.length, 2);
  assert.deepEqual(
    result.files.map((file) => file.name),
    ["ios/app.xliff", "android/strings.resx"]
  );
  assert.equal(result.archives[0]?.archiveName, "bundle.zip");
  assert.equal(result.archives[0]?.extractedCount, 2);
  assert.equal(result.archives[0]?.ignoredCount, 2);
  assert.equal(await result.files[0]?.file.text(), "<xliff version=\"1.2\"></xliff>");
});
