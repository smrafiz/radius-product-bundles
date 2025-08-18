/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
}>;


export type GetProductsQuery = { products: { nodes: Array<Pick<AdminTypes.Product, 'id' | 'title' | 'tags'>> } };

interface GeneratedQueryTypes {
  "\n    query getProducts($first: Int!) {\n        products(first: $first) {\n            nodes {\n                id\n                title\n                tags\n            }\n        }\n    }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
