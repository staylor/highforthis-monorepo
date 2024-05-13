import { useState } from 'react';
import cn from 'classnames';

import Select from '@/components/Form/Select';

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
        <p className="mb-8 mt-2">
          {ids.map((id: string, i: number) => (
            <span className="ml-2" key={`span-${id}`}>
              {entityMap[id].name}
              <button
                onClick={removeId(id)}
                className={cn(
                  'relative top-1',
                  'before:block before:rounded-full before:text-center before:antialiased',
                  'dashicons-before before:h-5 before:w-5 before:text-base',
                  'before:content-dismiss before:text-pink before:ml-0.5'
                )}
              >
                {' '}
              </button>
              <input key={id} type="hidden" name={`${name}[${i}]`} value={id} />
            </span>
          ))}
        </p>
      )}
    </>
  );
}
