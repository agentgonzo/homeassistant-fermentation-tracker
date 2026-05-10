export function sgToPlato(sg: number): number {
  return -616.868 + 1111.14 * sg - 630.272 * sg ** 2 + 135.997 * sg ** 3;
}

export function sgToBrix(sg: number): number {
  return sgToPlato(sg);
}

export function calcAttenuation(og: number, fg: number): number {
  return ((og - fg) / (og - 1.0)) * 100;
}

export function calcAbv(og: number, fg: number): number {
  return (og - fg) * 131.25;
}
