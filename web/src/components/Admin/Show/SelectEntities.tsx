import { useState } from 'react';

import Select from '#/components/Form/Select';
import Icon from '#/components/Icon';

import { sortNodes, type EntityNode } from './utils';

interface SelectEntityProps {
  name: string;
  nodes: EntityNode[];
  filtered: EntityNode[];
}

export default function SelectEntities({ name, nodes, filtered }: SelectEntityProps) {
  const [ids, setIds] = useState(nodes.map(({ id }) => id));
  const { sorted, entityMap } = sortNodes(nodes, filtered);

  const removeId = (id: string) => () => {
    const existing = [...ids];
    existing.splice(ids.indexOf(id), 1);
    setIds(existing);
  };

  return (
    <>
      <Select
        placeholder="---"
        choices={sorted.map((node) => ({
          label: node.name,
          value: node.id,
        }))}
        onChange={(value: string) => {
          if (value) {
            setIds([...ids, value]);
          }
        }}
      />
      {ids.length > 0 && (
        <p className="mt-2 mb-8">
          {ids.map((id: string, i: number) => (
            <span className="ml-2" key={`span-${id}`}>
              {entityMap[id].name}
              <button
                type="button"
                aria-label={`Remove ${entityMap[id].name}`}
                onClick={removeId(id)}
                className="text-pink relative top-1 ml-0.5 inline-flex h-5 w-5 items-center justify-center"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
              <input key={id} type="hidden" name={`${name}[${i}]`} value={id} />
            </span>
          ))}
        </p>
      )}
    </>
  );
}
