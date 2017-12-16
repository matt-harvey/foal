import { Context, HttpError, MethodBinding } from '@foal/core';
import { Router } from 'express';

import { ExpressMiddleware } from './interfaces';

export function getExpressMiddleware(methodBinding: MethodBinding): ExpressMiddleware {
  const expressMiddleware: ExpressMiddleware = async (req, res, next) => {
    const ctx: Context = {
      body: req.body,
      getHeader: req.get.bind(req),
      params: req.params,
      query: req.query,
      session: undefined,
      state: {},
    };
    try {
      for (const middleware of methodBinding.middlewares) {
        await middleware(ctx);
      }
      if (typeof ctx.result === 'number') {
        ctx.result = ctx.result.toString();
      }
      res.status(methodBinding.successStatus).send(ctx.result);
    } catch (err) {
      if (err instanceof HttpError) {
        res.sendStatus(err.statusCode);
      } else {
        console.error(err);
        res.sendStatus(500);
      }
    }
  };

  const path = methodBinding.paths.join('/').replace(/(\/)+/g, '/') || '/';
  const router = Router();

  switch (methodBinding.httpMethod) {
    case 'DELETE':
      router.delete(path, expressMiddleware);
      break;
    case 'GET':
      router.get(path, expressMiddleware);
      break;
    case 'PATCH':
      router.patch(path, expressMiddleware);
      break;
    case 'POST':
      router.post(path, expressMiddleware);
      break;
    case 'PUT':
      router.put(path, expressMiddleware);
      break;
  }

  return router;
}