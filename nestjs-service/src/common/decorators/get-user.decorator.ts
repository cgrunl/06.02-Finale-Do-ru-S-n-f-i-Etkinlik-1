import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * GetUser decorator: JWT doğrulamasından sonra req.user'dan kullanıcı bilgilerini çeker.
 * Kullanım: @GetUser() user veya @GetUser('id') userId
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
