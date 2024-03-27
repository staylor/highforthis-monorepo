import qs from 'qs';
import cn from 'classnames';

import Image from '@/components/Image';
import type { VenueCoordinates } from '@/types/graphql';
import { useRootData } from '@/utils/rootData';

interface MapProps {
  name?: string;
  size?: number;
  className?: string;
  coordinates: VenueCoordinates;
}

export default function Map({ name, className, coordinates, size = 300 }: MapProps) {
  const data = useRootData();
  const key = data.apiKeys?.googleMaps;
  if (!key) {
    return null;
  }

  const center = `${coordinates.latitude},${coordinates.longitude}`;
  const params = {
    zoom: 15,
    center,
    size: `${size}x${size}`,
    key,
    style: 'feature:all|element:all|saturation:-100',
    markers: `size:normal|color:0xe50082|label:${name}|${center}`,
  };
  const addendum = {
    style: 'feature:poi|visibility:off',
  };
  const src = `https://maps.googleapis.com/maps/api/staticmap?${qs.stringify(params)}&${qs.stringify(addendum)}`;

  return (
    <a
      className="mb-12 block md:mb-0"
      style={{ width: size, height: size }}
      href={`http://maps.apple.com/?${qs.stringify({
        q: name,
        ll: center,
        z: 18,
      })}`}
    >
      <Image width={size} height={size} className={cn('block', className)} src={src} />
    </a>
  );
}
