import type { NextConfig } from "next";

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const githubPagesAssetPrefix = "/todaystudy";

const nextConfig: NextConfig = isGitHubPages
  ? {
      assetPrefix: githubPagesAssetPrefix,
      images: { unoptimized: true },
      output: "export",
      trailingSlash: true,
    }
  : {};

export default nextConfig;
