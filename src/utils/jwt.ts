import jwt from 'jsonwebtoken'

const SECRET = process.env.SECRET_JWT ?? 'SECRET'

export const verifyJwt = <T>(token: string) => {
  return jwt.verify(token, SECRET) as T
}

export const signJwt = (payload: string | object) => {
  return jwt.sign(payload, SECRET)
}
