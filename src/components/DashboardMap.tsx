"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet blank icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const myIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-teal.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const peerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function DashboardMap({ source, matches }: { source: any, matches: any[] }) {
  if (!source) return <div>Loading map...</div>;

  return (
    <MapContainer 
        center={[source.lat, source.lon]} 
        zoom={6} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[source.lat, source.lon]} icon={myIcon}>
        <Popup>
          <strong>Your Facility</strong><br />Surat
        </Popup>
      </Marker>
      
      {matches.map(m => (
        <Marker key={m.id} position={[m.lat, m.lon]} icon={peerIcon}>
          <Popup>
            <strong>{m.name}</strong><br />{m.city}
          </Popup>
        </Marker>
      ))}

      {matches.map(m => (
        <Polyline 
            key={`line-${m.id}`} 
            positions={[[source.lat, source.lon], [m.lat, m.lon]]} 
            color="#a78bfa" 
            dashArray="10, 10" 
            className="animate-dash" 
        />
      ))}
    </MapContainer>
  );
}
