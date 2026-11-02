import { MAP_MODES, type MapMode } from './map-styles';
import styles from './LatencyGlobe.module.css';

export function MapModeToggle({
  mode,
  onChange,
}: {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
}) {
  return (
    <div className={styles.modes} role="group" aria-label="Map style">
      {MAP_MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={mode === id ? styles.active : undefined}
          aria-pressed={mode === id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className={styles.zoom}>
      <button type="button" onClick={onZoomIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" onClick={onZoomOut} aria-label="Zoom out">
        −
      </button>
    </div>
  );
}
