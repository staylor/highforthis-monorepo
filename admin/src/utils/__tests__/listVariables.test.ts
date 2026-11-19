import { addPageOffset, addSearchParam } from '#/utils/listVariables';

describe('listVariables', () => {
  it('asks for a page of rows, after the cursor of the last row on the previous page', () => {
    expect(addPageOffset(new URLSearchParams())).toEqual({ first: 20 });
    // Page 2 starts after row 19: base64 of 'arrayconnection:19', as GraphQL's connections encode it
    expect(addPageOffset(new URLSearchParams('page=2'))).toEqual({
      first: 20,
      after: 'YXJyYXljb25uZWN0aW9uOjE5',
    });
    expect(addPageOffset(new URLSearchParams('page=2'), { first: 8 }).after).toBe(
      btoa('arrayconnection:7')
    );
  });

  it('adds the search term when there is one', () => {
    expect(addSearchParam(new URLSearchParams('search=wilco'))).toEqual({ search: 'wilco' });
    expect(addSearchParam(new URLSearchParams('search='))).toEqual({});
  });
});
