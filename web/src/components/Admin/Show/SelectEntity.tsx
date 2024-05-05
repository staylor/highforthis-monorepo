import Select from '@/components/Form/Select';
import Link from '@/components/Link';

interface SelectEntityProps {
  label: string;
  name: string;
  edges: {
    node: {
      id: string;
      name: string;
    };
  }[];
  value?: string;
}

export default function SelectEntity({ label, name, edges, value }: SelectEntityProps) {
  return (
    <>
      <Select
        name={name}
        placeholder="---"
        value={value}
        choices={edges.map(({ node }) => ({
          label: node.name,
          value: node.id,
        }))}
      />
      <p className="mb-8 mt-2">
        <Link className="ml-2 text-pink underline" to={`/admin/${name}/add`}>
          Add {label}
        </Link>
        {value && (
          <Link className="ml-4 text-pink underline" to={`/admin/${name}/${value}`}>
            Edit {label}
          </Link>
        )}
      </p>
    </>
  );
}
