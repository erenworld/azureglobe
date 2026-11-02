// Original pixel-art star. '#' body, 'o' outline, '+' shine, '.' empty.
const PIXELS = [
  '......o......',
  '.....o#o.....',
  '.....o#o.....',
  '....o#+#o....',
  'oooo##+##oooo',
  'o###########o',
  '.o#########o.',
  '..o#######o..',
  '...o#####o...',
  '..o###o###o..',
  '..o##o.o##o..',
  '.o##o...o##o.',
  '.ooo.....ooo.',
];

const COLORS: Record<string, string> = {
  o: '#b45309',
  '#': '#fbbf24',
  '+': '#fff7d1',
};

const RECTS = PIXELS.flatMap((row, y) =>
  [...row].flatMap((cell, x) => (COLORS[cell] ? [{ x, y, fill: COLORS[cell] }] : [])),
);

export function PixelStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${PIXELS[0].length} ${PIXELS.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {RECTS.map(({ x, y, fill }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />
      ))}
    </svg>
  );
}
