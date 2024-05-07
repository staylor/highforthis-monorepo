import { useMemo, useState } from 'react';
import cn from 'classnames';

import Select from '@/components/Form/Select';

interface EntityEdge {
  node: EntityNode;
}

interface EntityNode {
  id: string;
  name: string;
}

interface SelectEntityProps {
  name: string;
  edges: EntityEdge[];
  values?: string[];
}

export default function SelectEntities({ name, edges, values }: SelectEntityProps) {
  const [ids, setIds] = useState(values || []);
  const entityMap = useMemo(() => {
    return edges.reduce(
      (carry, { node }) => {
        carry[node.id] = node.name;
        return carry;
      },
      {} as Record<string, string>
    );
  }, [edges]);

  const removeId = (id: string) => () => {
    const existing = [...ids];
    existing.splice(ids.indexOf(id), 1);
    setIds(existing);
  };

  return (
    <>
      <Select
        placeholder="---"
        choices={edges.map(({ node }) => ({
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
              {entityMap[id]}
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
