export const urlWithParams = (path: string, params: {[key: string]: string}) => {
  const searchParams = new URLSearchParams(params)
  return `${path}?${searchParams}`
}
