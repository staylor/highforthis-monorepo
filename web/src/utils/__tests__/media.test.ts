import { uploadUrl } from '@/utils/media';

describe('media', () => {
  it('uploadUrl', () => {
    const url = uploadUrl('2018/01/31', 'foo.png');

    expect(url).toMatchSnapshot();
  });
});
