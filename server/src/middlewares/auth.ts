import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';
import { getDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// 요청에 추가될 사용자 정보 타입 확장
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      role: string;
    };
  }
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '인증 토큰이 필요합니다'
      });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET as string) as {
      id: number;
      email: string;
      role: string;
    };

    // 사용자 존재 여부 확인 (선택적)
    const db = await getDb();
    const user = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);
    console.log('debug user:', decoded.id);
    console.log(user);
    if (!user.length) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '사용자를 찾을 수 없습니다'
      });
    }

    // 요청 객체에 사용자 정보 첨부
    request.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // 인증 성공 시 명시적으로 다음 핸들러로 진행
    return;

  } catch (error) {
    console.log(error);
    return reply.status(401).send({
      error: 'Unauthorized',
      message: '유효하지 않은 토큰이거나 만료되었습니다'
    });
  }
};
