import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { CategoryEnum } from './models';
import { JsonSchema } from 'tv4';
import { NotFoundError } from '@offscale/custom-restify-errors';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('../../test/api/category_enum/schema');

export type CategoryEnumBodyReq = Request & IOrmReq & {body?: CategoryEnum, user_id?: string};

const handleCategoryEnum = (resolve, reject) => (category_enum?: CategoryEnum) =>
    category_enum == null ?
        reject(new NotFoundError('CategoryEnum'))
        : resolve(category_enum);

export const createCategoryEnum = (req: CategoryEnumBodyReq) => new Promise<CategoryEnum>((resolve, reject) => {
    if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const category_enum = new CategoryEnum();
    Object.keys(req.body).map(k => category_enum[k] = req.body[k]);

    req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum)
        .save(category_enum)
        .then(handleCategoryEnum(resolve, reject))
        .catch(reject);
});

export const getCategoryEnum = (req: Request & IOrmReq) => new Promise<CategoryEnum>((resolve, reject) =>
    req.params.name == null ?
        reject(new NotFoundError('req.params.name'))
        : req.getOrm().typeorm!.connection
            .getRepository(CategoryEnum)
            .findOne(req.params.name)
            .then(handleCategoryEnum(resolve, reject))
            .catch(reject)
);

export const getManyCategoryEnum = (req: Request & IOrmReq) => new Promise<CategoryEnum[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum)
        .find({
            order: {
                updatedAt: 'ASC'
            }
        })
        .then((category_enums?: CategoryEnum[]) =>
            category_enums == null || !category_enums.length ?
                reject(new NotFoundError('CategoryEnum'))
                : resolve(category_enums)
        )
        .catch(reject)
);

export const updateCategoryEnum = (req: CategoryEnumBodyReq) => new Promise<CategoryEnum>((resolve, reject) => {
    const CategoryEnumR = req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum);

    if (req.params.name == null)
        return reject(new NotFoundError('req.params.name'));
    else if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    CategoryEnumR.findOne(req.params.name)
        .then((category_enum?: CategoryEnum) => {
            if (category_enum == null) return createCategoryEnum(req);
            Object.keys(req.body).map(k => category_enum[k] = req.body[k]);
            CategoryEnumR
                .save(category_enum)
                .then(handleCategoryEnum(resolve, reject))
                .catch(reject);
        })
        .catch(reject);
});

export const removeCategoryEnum = (req: Request & IOrmReq & {user_id?: string}) => new Promise<void>((resolve, reject) => {
    const CategoryEnumR = req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum);

    if (req.params.name == null)
        return reject(new NotFoundError('req.params.name'));

    CategoryEnumR
        .findOne(req.params.name)
        .then((category_enum?: CategoryEnum) => {
            if (category_enum == null) {
                return resolve(void 0);
                // TODO: Add an `else if` here to only allow removed if admin
            } else
                req.getOrm().typeorm!.connection
                    .createQueryBuilder()
                    .delete()
                    .from(CategoryEnum)
                    .where('name = :name', { name: req.params.name })
                    .execute()
                    .then(() => resolve(void 0))
                    .catch(reject);
        })
        .catch(reject);
});
