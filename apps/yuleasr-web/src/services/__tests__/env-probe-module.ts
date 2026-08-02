export function getDev(): boolean {
  return import.meta.env.DEV;
}
export function getUrl(): string {
  return import.meta.env.DEV ? 'dev-default' : '';
}
