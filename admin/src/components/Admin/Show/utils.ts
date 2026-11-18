export interface EntityNode {
  id: string;
  name: string;
}

export const sortNodes = (nodes: EntityNode[], filtered: EntityNode[]) => {
  const saved = (nodes || []).filter(({ id }) => id);
  const entityMap = [...saved, ...filtered].reduce(
    (carry, node) => {
      carry[node.id] = node;
      return carry;
    },
    {} as Record<string, EntityNode>
  );
  const sorted = Object.values(entityMap);
  sorted.sort((a: EntityNode, b: EntityNode) => {
    if (a.name === b.name) {
      return 0;
    }
    return a.name < b.name ? -1 : 1;
  });
  return { entityMap, sorted };
};
