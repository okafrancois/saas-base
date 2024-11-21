export interface SecurityHeader {
  key: string
  value: string
}

export interface CSPDirectives {
  'default-src': string[]
  'script-src': string[]
  'style-src': string[]
  'img-src': string[]
  'connect-src': string[]
  'object-src': string[]
}