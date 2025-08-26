/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type CollectionFilterFieldsFragment = Pick<AdminTypes.Collection, 'id' | 'title'>;

export type CollectionFieldsFragment = Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'>;

export type CollectionDetailsFieldsFragment = (
  Pick<AdminTypes.Collection, 'id' | 'title' | 'handle' | 'description' | 'updatedAt'>
  & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>> }
);

export type ImageFieldsFragment = Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>;

export type MoneyFieldsFragment = Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>;

export type PageInfoFieldsFragment = Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'>;

export type ProductFieldsFragment = (
  Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status' | 'vendor' | 'productType' | 'tags' | 'totalInventory' | 'createdAt' | 'updatedAt'>
  & { featuredImage?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, variants: { nodes: Array<(
      Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice' | 'sku' | 'barcode' | 'inventoryQuantity' | 'availableForSale'>
      & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, inventoryItem: Pick<AdminTypes.InventoryItem, 'tracked'> }
    )> }, collections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }> } }
);

export type ProductCardFieldsFragment = (
  Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'vendor'>
  & { featuredImage?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
);

export type VariantFieldsFragment = (
  Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice' | 'sku' | 'barcode' | 'inventoryQuantity' | 'availableForSale'>
  & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, inventoryItem: Pick<AdminTypes.InventoryItem, 'tracked'> }
);

export type GetCollectionsForFiltersQueryVariables = AdminTypes.Exact<{
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetCollectionsForFiltersQuery = { collections: { edges: Array<(
      Pick<AdminTypes.CollectionEdge, 'cursor'>
      & { node: Pick<AdminTypes.Collection, 'id' | 'title'> }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> }, products: { edges: Array<{ node: Pick<AdminTypes.Product, 'productType' | 'status'> }> } };

export type GetCollectionsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetCollectionsQuery = { collections: { edges: Array<(
      Pick<AdminTypes.CollectionEdge, 'cursor'>
      & { node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> } };

export type GetCollectionByHandleQueryVariables = AdminTypes.Exact<{
  handle: AdminTypes.Scalars['String']['input'];
}>;


export type GetCollectionByHandleQuery = { collectionByHandle?: AdminTypes.Maybe<(
    Pick<AdminTypes.Collection, 'id' | 'title' | 'handle' | 'description' | 'updatedAt'>
    & { products: { edges: Array<(
        Pick<AdminTypes.ProductEdge, 'cursor'>
        & { node: (
          Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'vendor'>
          & { featuredImage?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
        ) }
      )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> }, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>> }
  )> };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  sortKey?: AdminTypes.InputMaybe<AdminTypes.ProductSortKeys>;
  reverse?: AdminTypes.InputMaybe<AdminTypes.Scalars['Boolean']['input']>;
}>;


export type GetProductsQuery = { products: { edges: Array<(
      Pick<AdminTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status' | 'vendor' | 'productType' | 'tags' | 'totalInventory' | 'createdAt' | 'updatedAt'>
        & { allCollections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }> }, featuredImage?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, variants: { nodes: Array<(
            Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice' | 'sku' | 'barcode' | 'inventoryQuantity' | 'availableForSale'>
            & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, inventoryItem: Pick<AdminTypes.InventoryItem, 'tracked'> }
          )> }, collections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }> } }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> } };

export type GetProductByIdQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetProductByIdQuery = { product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'vendor' | 'productType' | 'tags' | 'totalInventory'>> };

export type GetShopInfoQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopInfoQuery = { shop: (
    Pick<AdminTypes.Shop, 'currencyCode' | 'myshopifyDomain' | 'email' | 'name'>
    & { plan: Pick<AdminTypes.ShopPlan, 'displayName'>, billingAddress: Pick<AdminTypes.ShopAddress, 'countryCode'> }
  ) };

interface GeneratedQueryTypes {
  "query GetCollectionsForFilters($query: String, $first: Int!, $after: String) {\n  collections(first: $first, after: $after, query: $query, sortKey: TITLE) {\n    edges {\n      node {\n        ...CollectionFilterFields\n      }\n      cursor\n    }\n    pageInfo {\n      ...PageInfoFields\n    }\n  }\n  products(first: 100) {\n    edges {\n      node {\n        productType\n        status\n      }\n    }\n  }\n}\n\nquery GetCollections($first: Int!, $after: String, $query: String) {\n  collections(first: $first, after: $after, query: $query) {\n    edges {\n      node {\n        ...CollectionFields\n      }\n      cursor\n    }\n    pageInfo {\n      ...PageInfoFields\n    }\n  }\n}\n\nquery GetCollectionByHandle($handle: String!) {\n  collectionByHandle(handle: $handle) {\n    ...CollectionDetailsFields\n    products(first: 50) {\n      edges {\n        node {\n          ...ProductCardFields\n        }\n        cursor\n      }\n      pageInfo {\n        ...PageInfoFields\n      }\n    }\n  }\n}": {return: never, variables: GetCollectionsForFiltersQueryVariables & GetCollectionsQueryVariables & GetCollectionByHandleQueryVariables},
  "query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {\n  products(\n    first: $first\n    after: $after\n    query: $query\n    sortKey: $sortKey\n    reverse: $reverse\n  ) {\n    edges {\n      node {\n        ...ProductFields\n        allCollections: collections(first: 100) {\n          edges {\n            node {\n              id\n              title\n              handle\n            }\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      ...PageInfoFields\n    }\n  }\n}\n\nquery GetProductById($id: ID!) {\n  product(id: $id) {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    totalInventory\n  }\n}": {return: never, variables: GetProductsQueryVariables & GetProductByIdQueryVariables},
  "query GetShopInfo {\n  shop {\n    currencyCode\n    myshopifyDomain\n    email\n    name\n    plan {\n      displayName\n    }\n    billingAddress {\n      countryCode\n    }\n  }\n}": {return: GetShopInfoQuery, variables: GetShopInfoQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
