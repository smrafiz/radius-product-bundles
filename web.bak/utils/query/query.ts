import { DocumentNode } from "graphql";

export function queryKey(document: DocumentNode, variables?: object) {
    const name = (document.definitions[0] as any).name?.value ?? "GraphQLQuery";

    return [name, variables];
}
