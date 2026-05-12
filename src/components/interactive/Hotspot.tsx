export interface HotspotProps {
  id: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  rotation?: number;
  onHover: () => void;
  onHoverOut: () => void;
  onClick: () => void;
}

export const Hotspot = ({ x, y, width, height, rotation = 0, onHover, onHoverOut, onClick }: HotspotProps) => {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onHoverOut}
      onClick={onClick}
      className="absolute cursor-pointer border-2 border-transparent hover:border-white/20 transition-all duration-300"
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: `rotate(${rotation}deg)`
      }}
    />
  );
};
