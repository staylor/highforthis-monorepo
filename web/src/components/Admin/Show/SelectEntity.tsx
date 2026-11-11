import { useTranslation } from 'react-i18next';

import Select from '#/components/Form/Select';
import Link from '#/components/Link';

import { sortNodes, type EntityNode } from './utils';

interface SelectEntityProps {
  name: string;
  node: EntityNode;
  filtered: EntityNode[];
}

export default function SelectEntity({ name, node, filtered }: SelectEntityProps) {
  const { t } = useTranslation();
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
      <p className="mt-2 mb-8">
        <Link className="ml-2 text-pink underline" to={`/admin/${name}/add`}>
          {t(`entity.add.${name}`)}
        </Link>
        {node.id && (
          <Link className="ml-4 text-pink underline" to={`/admin/${name}/${node.id}`}>
            {t(`entity.edit.${name}`)}
          </Link>
        )}
      </p>
    </>
  );
}
