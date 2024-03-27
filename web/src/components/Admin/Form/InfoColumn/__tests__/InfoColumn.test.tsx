import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';

import InfoColumn from '@/components/Admin/Form/InfoColumn';

const label = 'Info!';

const button = <button type="button">Submit</button>;

const infoFields = [
  <p key="0">
    <input name="foo" />
  </p>,
];
const metaFields = [
  <p key="0">
    <input name="bar" />
  </p>,
];

describe('InfoColumn', () => {
  test('No props', () => {
    const { container } = render(<InfoColumn />);

    expect(container.firstChild).toMatchSnapshot();
  });

  test('with infoFields', () => {
    const { container } = render(<InfoColumn infoFields={infoFields} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  test('with metaFields', () => {
    const { container } = render(<InfoColumn metaFields={metaFields} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  test('with info and meta fields', () => {
    const { container } = render(<InfoColumn infoFields={infoFields} metaFields={metaFields} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  test('no button', () => {
    const { container } = render(
      <InfoColumn label={label} infoFields={infoFields} metaFields={metaFields} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('with button', () => {
    const { container } = render(
      <InfoColumn label={label} infoFields={infoFields} metaFields={metaFields} button={button} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
