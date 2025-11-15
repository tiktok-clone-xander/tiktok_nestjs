const config = {
  turbopack: {
    // Use the monorepo root so hoisted/centralized workspace packages
    // (installed at the repo root) are resolvable by Turbopack.
    root: '../',
  },
};

export default config;
