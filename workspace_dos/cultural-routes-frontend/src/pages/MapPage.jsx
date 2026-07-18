import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Coffee, Train, Sun, Moon, Filter } from 'lucide-react';
import L from 'leaflet';
import { culturalData } from '../data';

// Arreglando el problema del icono por defecto en Leaflet con React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para actualizar el centro del mapa dinámicamente
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const defaultCenter = [-33.4372, -70.6342];
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');
  
  // Elemento cultural seleccionado que persiste memoria local
  const [selectedItemId, setSelectedItemId] = useState(() => {
    return localStorage.getItem('lastSelectedWork') || 'l1';
  });
  
  // Guardamos el cambio en memoria al interactuar con el select
  useEffect(() => {
    localStorage.setItem('lastSelectedWork', selectedItemId);
  }, [selectedItemId]);
  const [isLightMode, setIsLightMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    metro: true,
    cafe: true,
    route: true
  });

  // Base de datos cartográfica local por ID de libro/obra
  const routeScenarios = {
    'l1': [ // Tengo miedo torero
      { id: 1, pos: [-33.4385, -70.6330], type: 'metro', title: 'Metro Baquedano (L1, L5)', desc: 'Conexión principal para iniciar tu ruta.' },
      { id: 2, pos: [-33.4365, -70.6355], type: 'cafe', title: 'Café Literario Parque Balmaceda', desc: 'Lugar ideal para una pausa entre rutas.' },
      { id: 3, pos: [-33.4330, -70.6350], type: 'route', title: 'Barrio Bellavista', desc: 'Inicio de la experiencia inmersiva de la Loca del Frente.' },
      { id: 4, pos: [-33.4320, -70.6440], type: 'metro', title: 'Metro Bellas Artes (L5)', desc: 'Para continuar la ruta en el casco histórico.' },
      { id: 5, pos: [-33.4380, -70.6410], type: 'route', title: 'Cerro Santa Lucía', desc: 'Escenario de múltiples novelas y poemas santiaguinos.' }
    ],
    'p2': [ // Machuca
      { id: 1, pos: [-33.4116, -70.5714], type: 'route', title: 'Colegio Saint George', desc: 'Sede de las principales tramas sociales de la obra.' },
      { id: 2, pos: [-33.4075, -70.5730], type: 'cafe', title: 'Cafetería de la Avenida', desc: 'Pausa urbana en el sector precordillerano.' },
      { id: 3, pos: [-33.4150, -70.5800], type: 'metro', title: 'Metro Escuela Militar', desc: 'Punto de conexión urbano principal.' },
      { id: 4, pos: [-33.4300, -70.6000], type: 'route', title: 'Ribera del Río Mapocho', desc: 'Contexto periférico de la obra popular.' },
      { id: 5, pos: [-33.4350, -70.6120], type: 'metro', title: 'Metro Los Leones', desc: 'Acercamiento y conexión al retorno.' }
    ],
    'm3': [ // El Reemplazante
      { id: 1, pos: [-33.4862, -70.6480], type: 'route', title: 'Instituto Pedro Aguirre Cerda', desc: 'Liceo donde se enmarca la historia de Charlie.' },
      { id: 2, pos: [-33.4820, -70.6500], type: 'cafe', title: 'Emporio y Café de Barrio PAC', desc: 'Lectura y vida cívica.' },
      { id: 3, pos: [-33.4750, -70.6550], type: 'metro', title: 'Metro Lo Ovalle', desc: 'Conexión con el gran Santiago desde el Sur.' },
      { id: 4, pos: [-33.4500, -70.6600], type: 'route', title: 'San Miguel Histórico', desc: 'Caminatas del protagonista y sus reflexiones.' },
      { id: 5, pos: [-33.4400, -70.6550], type: 'metro', title: 'Metro Toesca', desc: 'Conexión céntrica y universitaria.' }
    ]
  };

  // Obtenemos los puntos, si la obra no tiene escenario customizado, mostramos algo genérico.
  const pointsOfInterest = routeScenarios[selectedItemId] || [
      { id: 1, pos: [-33.4420, -70.6530], type: 'metro', title: 'Metro La Moneda', desc: 'Centro Cívico.' },
      { id: 2, pos: [-33.4390, -70.6500], type: 'cafe', title: 'Café del Centro', desc: 'Pausa en medio de la ciudad.' },
      { id: 3, pos: [-33.4400, -70.6450], type: 'route', title: 'Punto Cultural', desc: 'Hito histórico del relato.' }
  ];

  // Encontrar el objeto cultural para el UI
  const allItems = culturalData.flatMap(c => c.items);
  const selectedItemData = allItems.find(i => i.id === selectedItemId);

  // Recalcular el centro cuando cambie la selección (volaremos al primer punto de la ruta)
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    if(pointsOfInterest.length > 0) {
      setMapCenter(pointsOfInterest[0].pos);

      // OSRM: formato de longitud,latitud;longitud,latitud
      const coordsString = pointsOfInterest.map(p => `${p.pos[1]},${p.pos[0]}`).join(';');

      fetch(`https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data && data.routes && data.routes.length > 0) {
            const pathCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoutePath(pathCoords);
          } else {
            setRoutePath(pointsOfInterest.map(p => p.pos));
          }
        })
        .catch(err => {
          console.error("OSRM Error:", err);
          setRoutePath(pointsOfInterest.map(p => p.pos));
        });
    }
  }, [selectedItemId]);

  const handleLocateMe = () => {
    setLoadingLocation(true);
    setErrorInfo('');
    if (!navigator.geolocation) {
      setErrorInfo('Tu navegador no soporta geolocalización');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLoadingLocation(false);
      },
      (error) => {
        setErrorInfo('Por favor, permite el acceso a tu ubicación en el navegador.');
        setLoadingLocation(false);
      }
    );
  };

  const toggleFilter = (type) => {
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filtrar los puntos basados en el estado
  const filteredPoints = pointsOfInterest.filter(pt => activeFilters[pt.type]);

  const tileUrl = isLightMode 
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Capa clara/colorida CartoDB Voyager
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; // Capa oscura

  return (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '48px', marginBottom: '8px' }}>Mapa de Rutas</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Ruta propuesta para:</p>
            <select 
              value={selectedItemId} 
              onChange={(e) => setSelectedItemId(e.target.value)}
              style={{ background: '#181820', color: 'white', border: '1px solid #333', padding: '8px 16px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
            >
              {allItems.map(item => (
                <option key={item.id} value={item.id}>{item.title} ({item.category})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Botón de Tema Light/Dark */}
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            style={{
              background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px',
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title={isLightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button 
            onClick={handleLocateMe}
            style={{
              background: 'var(--accent)', color: 'black', border: 'none', padding: '12px 24px',
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: '600'
            }}
          >
            <Navigation size={20} />
            {loadingLocation ? 'Buscando...' : 'Obtener Ubicación'}
          </button>
        </div>
      </div>

      {errorInfo && <p style={{ color: 'red', marginBottom: '16px' }}>{errorInfo}</p>}

      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
        
        <MapContainer center={userLocation || defaultCenter} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer url={tileUrl} attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
          <MapUpdater center={userLocation} />

          {userLocation && (
            <Marker position={userLocation}>
              <Popup><div style={{ color: 'black', fontWeight: 'bold' }}>📍 Estás Aquí</div></Popup>
            </Marker>
          )}

          {filteredPoints.map(pt => {
            // Generar el icono basado en el tipo para destacar cada categoría
            let bgColor = '#5B4CF6';
            let emoji = '🚇';
            if (pt.type === 'cafe') { bgColor = '#C9A84C'; emoji = '☕'; }
            if (pt.type === 'route') { bgColor = '#E53E3E'; emoji = '📜'; }

            const customIcon = L.divIcon({
              className: 'custom-map-icon',
              html: `<div style="background-color: ${bgColor}; color: white; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 18px;">${emoji}</div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
              popupAnchor: [0, -18]
            });

            return (
              <Marker key={pt.id} position={pt.pos} icon={customIcon}>
                <Popup>
                  <div style={{ color: 'black' }}>
                    <h4 style={{ margin: '0 0 4px 0', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                      {emoji} {pt.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px' }}>{pt.desc}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Rutas (Pisadas de la historia por calles) */}
          {activeFilters.route && routePath.length > 0 && (
            <Polyline 
              positions={routePath}
              color="#E53E3E"
              weight={5}
              dashArray="10, 15"
              opacity={0.8}
            />
          )}
        </MapContainer>

        {/* Panel de Filtros flotante */}
        <div className="glass" style={{
          position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000,
          padding: '16px 24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <h3 style={{ margin: 0, color: isLightMode ? '#333' : 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <Filter size={18} /> Filtrar Mapa
          </h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => toggleFilter('metro')} style={{ background: activeFilters.metro ? '#5B4CF6' : 'transparent', color: activeFilters.metro ? 'white' : 'var(--text-muted)', border: '1px solid #5B4CF6', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Train size={16}/> Metros
            </button>
            <button onClick={() => toggleFilter('cafe')} style={{ background: activeFilters.cafe ? '#C9A84C' : 'transparent', color: activeFilters.cafe ? 'black' : 'var(--text-muted)', border: '1px solid #C9A84C', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coffee size={16}/> Cafés
            </button>
            <button onClick={() => toggleFilter('route')} style={{ background: activeFilters.route ? '#E53E3E' : 'transparent', color: activeFilters.route ? 'white' : 'var(--text-muted)', border: '1px solid #E53E3E', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16}/> Cultura
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
