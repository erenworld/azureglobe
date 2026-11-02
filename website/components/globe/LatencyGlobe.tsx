'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { LatencyView } from '@/lib/view';
import { addLatencyLayers, REGION_HIT_LAYER, setRegionHover, updateLatencyLayers } from './layers';
import { MapModeToggle, ZoomControls } from './MapControls';
import { fitZoom, MAP_STYLES, type MapMode } from './map-styles';
import styles from './LatencyGlobe.module.css';

type Props = {
  view: LatencyView;
  hovered: number | null;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
};

/** Interactive MapLibre globe showing latency routes from one origin. */
export function LatencyGlobe({ view, hovered, onSelect, onHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mode, setMode] = useState<MapMode>('plan');
  // True once our layers are on the map (false again while a style loads).
  const [ready, setReady] = useState(false);

  const handleStyleLoad = useEffectEvent((map: MapLibreMap) => {
    addLatencyLayers(map, view, mode === 'satellite');
    setReady(true);
  });
  const handleSelect = useEffectEvent((index: number) => onSelect(index));
  const handleHover = useEffectEvent((index: number | null) => onHover(index));
  const initialCenter = useEffectEvent(() => view.from);
  const initialStyle = useEffectEvent(() => MAP_STYLES[mode]);

  // Create the map once. MapLibre is loaded lazily: it needs `window`.
  useEffect(() => {
    let map: MapLibreMap | null = null;
    let cancelled = false;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      map = new maplibregl.Map({
        container,
        style: initialStyle(),
        center: initialCenter(),
        zoom: fitZoom(container.clientWidth),
        minZoom: 0,
        maxZoom: 8,
        attributionControl: { compact: true },
        renderWorldCopies: false,
      });
      mapRef.current = map;

      map.on('style.load', () => map && handleStyleLoad(map));
      map.once('load', () => {
        // The container has its final size now: fit the globe again, and keep
        // the attribution collapsed (it opens by default on small screens).
        map?.jumpTo({ zoom: fitZoom(container.clientWidth) });
        container
          .querySelector('.maplibregl-ctrl-attrib')
          ?.classList.remove('maplibregl-compact-show');
      });

      map.on('click', REGION_HIT_LAYER, (e) => {
        const index = e.features?.[0]?.properties.index;
        if (typeof index === 'number') handleSelect(index);
      });
      map.on('mousemove', REGION_HIT_LAYER, (e) => {
        map?.getCanvas().style.setProperty('cursor', 'pointer');
        const index = e.features?.[0]?.properties.index;
        if (typeof index === 'number') handleHover(index);
      });
      map.on('mouseleave', REGION_HIT_LAYER, () => {
        map?.getCanvas().style.removeProperty('cursor');
        handleHover(null);
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // New data (another origin, or live results coming in).
  useEffect(() => {
    if (ready && mapRef.current) updateLatencyLayers(mapRef.current, view);
  }, [view, ready]);

  // New origin: fly to it.
  const flyToOrigin = useEffectEvent((map: MapLibreMap) => {
    const maxZoom = fitZoom(map.getContainer().clientWidth) + 1.1;
    map.flyTo({ center: view.from, zoom: Math.min(map.getZoom(), maxZoom), duration: 1200 });
  });
  useEffect(() => {
    if (ready && mapRef.current) flyToOrigin(mapRef.current);
  }, [view.key, ready]);

  // Highlight the hovered region and its route.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || hovered === null) return;
    setRegionHover(map, hovered, true);
    return () => setRegionHover(map, hovered, false);
  }, [hovered, ready]);

  const changeMode = (next: MapMode) => {
    if (next === mode) return;
    setMode(next);
    setReady(false);
    mapRef.current?.setStyle(MAP_STYLES[next]);
  };

  return (
    <div className={`${styles.globe} ${mode === 'satellite' ? styles.dark : ''}`}>
      <div ref={containerRef} className={styles.map} />
      <MapModeToggle mode={mode} onChange={changeMode} />
      <ZoomControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
      />
    </div>
  );
}
