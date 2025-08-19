/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetCollectionsForFiltersQueryVariables = AdminTypes.Exact<{
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetCollectionsForFiltersQuery = { collections: { edges: Array<(
      Pick<AdminTypes.CollectionEdge, 'cursor'>
      & { node: Pick<AdminTypes.Collection, 'id' | 'title'> }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage'> } };

export type GetProductByIdQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetProductByIdQuery = { product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'vendor' | 'productType' | 'tags' | 'totalInventory'>> };

export type GetProductFiltersQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetProductFiltersQuery = { shop: (
    Pick<AdminTypes.Shop, 'id'>
    & { productTypes: { edges: Array<Pick<AdminTypes.StringEdge, 'node'>> }, productVendors: { edges: Array<Pick<AdminTypes.StringEdge, 'node'>> }, productTags: { edges: Array<Pick<AdminTypes.StringEdge, 'node'>> } }
  ) };

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
        & { featuredImage?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>, variants: { nodes: Array<(
            Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice' | 'sku' | 'barcode' | 'inventoryQuantity' | 'availableForSale'>
            & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>>, inventoryItem: Pick<AdminTypes.InventoryItem, 'tracked'> }
          )> }, collections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }> } }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> } };

export type GetProductsWithVariantsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  sortKey?: AdminTypes.InputMaybe<AdminTypes.ProductSortKeys>;
  reverse?: AdminTypes.InputMaybe<AdminTypes.Scalars['Boolean']['input']>;
}>;


export type GetProductsWithVariantsQuery = { products: { edges: Array<(
      Pick<AdminTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status' | 'vendor' | 'productType' | 'tags' | 'totalInventory' | 'hasOnlyDefaultVariant' | 'tracksInventory' | 'totalVariants'>
        & { featuredMedia?: AdminTypes.Maybe<(
          Pick<AdminTypes.MediaImage, 'id'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>> }> }
        )>, variants: { edges: Array<{ node: (
              Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'displayName' | 'sku' | 'barcode' | 'price' | 'compareAtPrice' | 'availableForSale' | 'inventoryQuantity'>
              & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>, inventoryItem: Pick<AdminTypes.InventoryItem, 'id' | 'tracked'> }
            ) }> }, collections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'> }> } }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'> } };

interface GeneratedQueryTypes {
  "query GetCollectionsForFilters($query: String, $first: Int!, $after: String) {\n  collections(first: $first, after: $after, query: $query, sortKey: TITLE) {\n    edges {\n      node {\n        id\n        title\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n    }\n  }\n}": {return: GetCollectionsForFiltersQuery, variables: GetCollectionsForFiltersQueryVariables},
  "query GetProductById($id: ID!) {\n  product(id: $id) {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    totalInventory\n  }\n}": {return: GetProductByIdQuery, variables: GetProductByIdQueryVariables},
  "query GetProductFilters {\n  shop {\n    id\n    productTypes(first: 250) {\n      edges {\n        node\n      }\n    }\n    productVendors(first: 250) {\n      edges {\n        node\n      }\n    }\n    productTags(first: 250) {\n      edges {\n        node\n      }\n    }\n  }\n}": {return: GetProductFiltersQuery, variables: GetProductFiltersQueryVariables},
  "query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {\n  products(\n    first: $first\n    after: $after\n    query: $query\n    sortKey: $sortKey\n    reverse: $reverse\n  ) {\n    edges {\n      node {\n        id\n        title\n        handle\n        status\n        vendor\n        productType\n        tags\n        totalInventory\n        createdAt\n        updatedAt\n        featuredImage {\n          id\n          url\n          altText\n          width\n          height\n        }\n        variants(first: 100) {\n          nodes {\n            id\n            title\n            price\n            compareAtPrice\n            sku\n            barcode\n            inventoryQuantity\n            availableForSale\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              url\n              altText\n            }\n            inventoryItem {\n              tracked\n            }\n          }\n        }\n        collections(first: 10) {\n          edges {\n            node {\n              id\n              title\n              handle\n            }\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n      hasPreviousPage\n      startCursor\n    }\n  }\n}": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "query GetProductsWithVariants($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {\n  products(\n    first: $first\n    after: $after\n    query: $query\n    sortKey: $sortKey\n    reverse: $reverse\n  ) {\n    edges {\n      node {\n        id\n        title\n        handle\n        status\n        vendor\n        productType\n        tags\n        totalInventory\n        hasOnlyDefaultVariant\n        tracksInventory\n        totalVariants\n        featuredMedia {\n          ... on MediaImage {\n            id\n            preview {\n              image {\n                id\n                altText\n                url(transform: {maxHeight: 200, maxWidth: 200})\n              }\n            }\n          }\n        }\n        variants(first: 50) {\n          edges {\n            node {\n              id\n              title\n              displayName\n              sku\n              barcode\n              price\n              compareAtPrice\n              availableForSale\n              inventoryQuantity\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                id\n                altText\n                url(transform: {maxWidth: 100, maxHeight: 100})\n              }\n              inventoryItem {\n                id\n                tracked\n              }\n            }\n          }\n        }\n        collections(first: 10) {\n          edges {\n            node {\n              id\n              title\n              handle\n            }\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n  }\n}": {return: GetProductsWithVariantsQuery, variables: GetProductsWithVariantsQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
