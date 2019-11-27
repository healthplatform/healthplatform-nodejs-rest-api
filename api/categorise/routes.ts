import * as restify from 'restify';

import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';
import { NotFoundError } from '@offscale/custom-restify-errors';

import { has_auth } from '../auth/middleware';
import { Categorise } from './models';
import { CategoriseBodyReq, createMw } from './sdk';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('./../../test/api/categorise/schema');

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw(schema), createMw);

export const read = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as CategoriseBodyReq;
            // TODO: Add query params
            req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .find({
                    order: {
                        updatedAt: 'ASC'
                    }
                })
                .then((categorises: Categorise[]) => {
                    if (categorises == null || !categorises.length)
                        return next(new NotFoundError('Categorise'));
                    res.json({ categorises })
                })
                .catch(next);
        }
    );
