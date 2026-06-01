export const requiredResource = <Resource>(
  resource: Resource | null,
  label: string,
): Resource => {
  if (!resource) {
    throw new Error(`Failed to create WebGL ${label}.`)
  }

  return resource
}
