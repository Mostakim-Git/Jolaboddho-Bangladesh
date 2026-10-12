import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
export default function LocationMap({ lat, lng, onPick }) {
  const container = useRef();
  const map = useRef();
  const marker = useRef();
  const callback = useRef(onPick);
  callback.current = onPick;
  useEffect(() => {
    map.current = L.map(container.current, { center: [lat, lng], zoom: 13 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map.current);
    marker.current = L.circleMarker([lat, lng], {
      radius: 9,
      color: "#fff",
      weight: 3,
      fillColor: "#087d73",
      fillOpacity: 1,
    }).addTo(map.current);
    map.current.on("click", (e) => callback.current(e.latlng));
    return () => map.current.remove();
  }, []);
  useEffect(() => {
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= 20.5 &&
      lat <= 26.7 &&
      lng >= 88 &&
      lng <= 92.8
    ) {
      marker.current.setLatLng([lat, lng]);
      map.current.panTo([lat, lng]);
    }
  }, [lat, lng]);
  return (
    <>
      <div
        className="leaflet-map"
        ref={container}
        aria-label="Location map. Click to drop a pin, or enter coordinates below."
      />
      <p className="micro">
        Tap the map to place a pin. If map tiles are unavailable, enter
        coordinates below.
      </p>
    </>
  );
}
