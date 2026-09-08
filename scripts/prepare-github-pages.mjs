import { access, cp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function prepareGitHubPagesOutput(
  clientDirectory,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
) {
  const repositoryDirectory = basePath.replace(/^\/+|\/+$/g, "");

  if (!repositoryDirectory || repositoryDirectory.includes("/")) {
    throw new Error("NEXT_PUBLIC_BASE_PATH must contain one repository segment");
  }

  const nestedDirectory = join(clientDirectory, repositoryDirectory);
  const nestedNextDirectory = join(nestedDirectory, "_next");
  const publishedNextDirectory = join(clientDirectory, "_next");

  await access(nestedNextDirectory);
  await rm(publishedNextDirectory, { force: true, recursive: true });
  await cp(nestedNextDirectory, publishedNextDirectory, { recursive: true });
  await rm(nestedDirectory, { force: true, recursive: true });
  await writeFile(join(clientDirectory, ".nojekyll"), "");
}

const isExecutedDirectly =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isExecutedDirectly) {
  await prepareGitHubPagesOutput(resolve("dist/client"));
}
