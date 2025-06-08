import bcrypt from 'bcrypt'

/**
 * 비밀번호를 해싱하는 함수
 * @param password 해싱할 비밀번호
 * @returns 해싱된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * 비밀번호가 해싱된 비밀번호와 일치하는지 확인하는 함수
 * @param password 확인할 비밀번호
 * @param hashedPassword 해싱된 비밀번호
 * @returns 일치 여부
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}