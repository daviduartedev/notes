export function isDesignSystemEnabled(nodeEnv: string | undefined): boolean {
  return nodeEnv !== "production";
}
