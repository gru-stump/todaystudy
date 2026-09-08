export function assetPath(path, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "") {
  const normalizedBasePath = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBasePath}${normalizedPath}`;
}
