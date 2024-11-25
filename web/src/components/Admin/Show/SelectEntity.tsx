import Select from '~/components/Form/Select';
import Link from '~/components/Link';

import { sortNodes, type EntityNode } from './utils';

interface SelectEntityProps {
  label: string;
  name: string;
  node: EntityNode;
  filtered: EntityNode[];
}

export default function SelectEntity({ label, name, node, filtered }: SelectEntityProps) {
  const { sorted } = sortNodes([node], filtered);
  return (
    <>
      <Select
        name={name}
        placeholder="---"
        value={node.id}
        choices={sorted.map((node) => ({
          label: node.name,
          value: node.id,
        }))}
      />
      <p className="mb-8 mt-2">
        <Link className="ml-2 text-pink underline" to={`/admin/${name}/add`}>
          Add {label}
        </Link>
        {node.id && (
          <Link className="ml-4 text-pink underline" to={`/admin/${name}/${node.id}`}>
            Edit {label}
          </Link>
        )}
      </p>
    </>
  );
}
