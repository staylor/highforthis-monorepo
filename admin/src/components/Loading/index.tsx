import cn from 'classnames';

const bounceClass = cn('bg-dark absolute top-0 left-0 rounded-full opacity-60 size-full');

export default function Loading() {
  return (
    <div className="min-h-75 bg-white pt-25 dark:bg-black">
      <div className="relative mx-auto size-20">
        <div className={cn(bounceClass, 'animate-loading-1')} />
        <div className={cn(bounceClass, 'animate-loading-2')} />
      </div>
    </div>
  );
}
