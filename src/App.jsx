import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Map as MapIcon, Calendar as CalendarIcon, LayoutDashboard, User,
  Plus, X, Trash2, Pencil, Image as ImageIcon, Grid3x3, Droplet, Droplets,
  Sun, TreePine, TreeDeciduous, Trees, Flower, Flower2, Leaf, Carrot, Apple, Cherry, Grape, Wheat,
  Package, Warehouse, Home, Fence, Shovel, Scissors, Hammer, Wrench, Bug, Bird, Recycle,
  Trash2 as TrashIcon, Umbrella, Palmtree, Flame, Box, Tractor, Waves, Container,
  ChevronLeft, ChevronRight, Check, Upload, Download, RotateCcw, Info,
  Sprout, ZoomIn, ZoomOut, Magnet, Settings, History, Move,
  Shrub, Citrus, Egg, CloudSun, CloudRain, Snowflake, Thermometer, Wind,
  Rabbit, Fish, Squirrel, Cat, Dog, Lightbulb, Ruler, Axe, Compass, Fan
} from 'lucide-react';
import { storage } from './storage';

/* ------------------------------------------------------------------ */
/* Design tokens (DA GrowMap)                                          */
/* ------------------------------------------------------------------ */
const LIGHT_SURFACE = { bg: '#F8FAF7', card: '#FFFFFF', border: '#E8ECE7', text: '#2B2B2B', sub: '#6E6E6E' };
const DARK_SURFACE = { bg: '#151A14', card: '#1E241C', border: '#2C352A', text: '#F1F4EF', sub: '#9BA79B' };

// C is intentionally mutable: its brand colors (primary/forest/harvest/sky/tomato) never
// change, but its surface colors (bg/card/border/text/sub) are swapped in place when the
// theme toggles, so every component reading C.xxx at render time picks up the new values
// without needing the color object threaded through props.
const C = {
  primary: '#4CAF50', forest: '#2E7D32', harvest: '#F9A825', sky: '#42A5F5', tomato: '#E53935',
  ...LIGHT_SURFACE,
};
function applyTheme(mode) { Object.assign(C, mode === 'dark' ? DARK_SURFACE : LIGHT_SURFACE); }

const APP_VERSION = '1.0.0';

const CHANGELOG = [
  {
    version: '1.0.0',
    changes: [
      "Lancement de GrowMap : carte interactive de votre jardin (plan dessiné ou photo aérienne), avec zones potager, massif, haie, bâtiment et clôture",
      "Fiches détaillées par plante (variété, exposition, arrosage, périodes de semis et de récolte) et calendrier avec cycle automatique",
      "Bibliothèques d'éléments et de plantes entièrement personnalisables",
      "Tableau de bord et inventaire « Mes plantations »",
      "Application installable (PWA), utilisable sur ordinateur, tablette et mobile, avec mode clair et sombre",
      "Synchronisation des données via un dépôt GitHub et rappels par notification",
    ],
  },
];

const ZONE_TYPES = {
  potager: { label: 'Potager', icon: Carrot, color: C.primary, fill: 'rgba(76,175,80,0.24)', hasPlants: true, shape: 'polygon' },
  massif: { label: 'Massif', icon: Flower2, color: C.harvest, fill: 'rgba(249,168,37,0.24)', hasPlants: true, shape: 'polygon' },
  haie: { label: 'Haie', icon: TreePine, color: C.forest, fill: 'rgba(46,125,50,0.24)', hasPlants: true, shape: 'polygon' },
  batiment: { label: 'Bâtiment', icon: Home, color: '#8D6E63', fill: 'rgba(141,110,99,0.26)', hasPlants: true, shape: 'polygon' },
  cloture: { label: 'Clôture', icon: Fence, color: '#607D8B', fill: 'none', hasPlants: false, shape: 'line' },
};

const ICON_LIBRARY = [
  { key: 'treepine', icon: TreePine, label: 'Conifère' },
  { key: 'treedeciduous', icon: TreeDeciduous, label: 'Arbre feuillu' },
  { key: 'trees', icon: Trees, label: 'Bosquet' },
  { key: 'flower', icon: Flower, label: 'Fleur' },
  { key: 'flower2', icon: Flower2, label: 'Fleur (variante)' },
  { key: 'leaf', icon: Leaf, label: 'Feuille' },
  { key: 'sprout', icon: Sprout, label: 'Pousse' },
  { key: 'carrot', icon: Carrot, label: 'Carotte' },
  { key: 'apple', icon: Apple, label: 'Pommier' },
  { key: 'cherry', icon: Cherry, label: 'Cerisier' },
  { key: 'grape', icon: Grape, label: 'Vigne' },
  { key: 'wheat', icon: Wheat, label: 'Céréales' },
  { key: 'sun', icon: Sun, label: 'Soleil' },
  { key: 'droplet', icon: Droplet, label: 'Eau' },
  { key: 'droplets', icon: Droplets, label: 'Arrosage' },
  { key: 'package', icon: Package, label: 'Stockage' },
  { key: 'warehouse', icon: Warehouse, label: 'Serre / Abri' },
  { key: 'home', icon: Home, label: 'Cabane' },
  { key: 'fence', icon: Fence, label: 'Clôture' },
  { key: 'shovel', icon: Shovel, label: 'Outils' },
  { key: 'scissors', icon: Scissors, label: 'Taille' },
  { key: 'hammer', icon: Hammer, label: 'Bricolage' },
  { key: 'wrench', icon: Wrench, label: 'Réparation' },
  { key: 'bug', icon: Bug, label: 'Insectes' },
  { key: 'bird', icon: Bird, label: 'Oiseaux' },
  { key: 'recycle', icon: Recycle, label: 'Compost' },
  { key: 'trash2', icon: TrashIcon, label: 'Déchets' },
  { key: 'umbrella', icon: Umbrella, label: 'Abri pluie' },
  { key: 'palmtree', icon: Palmtree, label: 'Palmier' },
  { key: 'flame', icon: Flame, label: 'Feu / Barbecue' },
  { key: 'box', icon: Box, label: 'Rangement' },
  { key: 'tractor', icon: Tractor, label: 'Matériel' },
  { key: 'waves', icon: Waves, label: 'Bassin' },
  { key: 'container', icon: Container, label: 'Bac / Jardinière' },
  { key: 'shrub', icon: Shrub, label: 'Buisson' },
  { key: 'citrus', icon: Citrus, label: 'Agrume' },
  { key: 'egg', icon: Egg, label: 'Poulailler' },
  { key: 'cloudsun', icon: CloudSun, label: 'Éclaircies' },
  { key: 'cloudrain', icon: CloudRain, label: 'Pluie' },
  { key: 'snowflake', icon: Snowflake, label: 'Gel / Hiver' },
  { key: 'thermometer', icon: Thermometer, label: 'Température' },
  { key: 'wind', icon: Wind, label: 'Vent' },
  { key: 'rabbit', icon: Rabbit, label: 'Lapin' },
  { key: 'fish', icon: Fish, label: 'Bassin à poissons' },
  { key: 'squirrel', icon: Squirrel, label: 'Écureuil' },
  { key: 'cat', icon: Cat, label: 'Chat' },
  { key: 'dog', icon: Dog, label: 'Chien' },
  { key: 'lightbulb', icon: Lightbulb, label: 'Éclairage' },
  { key: 'ruler', icon: Ruler, label: 'Mesure' },
  { key: 'axe', icon: Axe, label: 'Bûcheronnage' },
  { key: 'compass', icon: Compass, label: 'Orientation' },
  { key: 'fan', icon: Fan, label: 'Ventilation' },
];
function getIcon(key) { return (ICON_LIBRARY.find((i) => i.key === key) || {}).icon || Package; }

const ELEMENT_COLORS = [C.primary, C.forest, C.harvest, C.sky, C.tomato, '#8D6E63', '#795548', '#009688', '#7E57C2', '#607D8B'];

const DEFAULT_ELEMENT_TYPES = [
  { key: 'arbre', label: 'Arbre fruitier', icon: 'treepine', color: C.forest, builtin: true },
  { key: 'serre', label: 'Serre', icon: 'warehouse', color: C.sky, builtin: true },
  { key: 'compost', label: 'Compost', icon: 'recycle', color: '#8D6E63', builtin: true },
  { key: 'eau', label: "Récupérateur d'eau", icon: 'droplets', color: C.sky, builtin: true },
];

const EXPOSURES = ['Plein soleil', 'Mi-ombre', 'Ombre'];
const WATER_NEEDS = ['Faible', 'Modéré', 'Fréquent'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const TASK_TYPES = {
  arrosage: { label: 'Arrosage', icon: Droplet, color: C.sky },
  semis: { label: 'Semis', icon: Sprout, color: C.primary },
  recolte: { label: 'Récolte', icon: Carrot, color: C.harvest },
  taille: { label: 'Taille', icon: Scissors, color: C.forest },
  entretien: { label: 'Entretien', icon: Pencil, color: C.sub },
};

const PLANT_LIBRARY = {
  potager: ['Tomate', 'Carotte', 'Courgette', 'Salade', 'Radis', 'Pomme de terre', 'Poireau', 'Haricot vert', 'Fraise', 'Oignon', 'Concombre', 'Poivron'],
  massif: ['Rose', 'Lavande', 'Tulipe', 'Dahlia', 'Hortensia', 'Géranium', 'Pivoine', "Œillet d'Inde"],
  haie: ['Laurier-cerise', 'Thuya', 'Charme', 'Photinia', 'Buis', 'Troène', 'Bambou', 'Cyprès de Leyland'],
};

// Finds the nearest snap target within `threshold` percent of (x,y): either a vertex of an
// existing zone, a point along one of its edges, or a vertex from `extraPoints` (used while
// actively drawing a new zone, so it can snap back onto its own not-yet-closed points).
function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  let t = lenSq > 0 ? ((px - ax) * abx + (py - ay) * aby) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  return { x: ax + t * abx, y: ay + t * aby };
}
function nearestSnapPoint(x, y, zones, extraPoints, threshold) {
  let best = null; let bestDist = threshold;
  zones.forEach((z) => {
    const pts = z.points;
    const isLine = ZONE_TYPES[z.type]?.shape === 'line';
    const edgeCount = isLine ? pts.length - 1 : pts.length;
    for (let i = 0; i < edgeCount; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const cp = closestPointOnSegment(x, y, a.x, a.y, b.x, b.y);
      const d = Math.hypot(cp.x - x, cp.y - y);
      if (d < bestDist) { bestDist = d; best = cp; }
    }
  });
  (extraPoints || []).forEach((p) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best ? { x: best.x, y: best.y } : { x, y };
}

const genId = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
function monthInRange(month, start, end) {
  if (!start) return false;
  const e = end || start;
  if (start <= e) return month >= start && month <= e;
  return month >= start || month <= e;
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */
function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled, title }) {
  const base = 'h-12 px-5 rounded-2xl font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    primary: { backgroundColor: C.primary, color: '#fff' },
    outline: { backgroundColor: C.card, color: C.text, border: `1px solid ${C.border}` },
    ghost: { backgroundColor: 'transparent', color: C.sub },
    danger: { backgroundColor: C.card, color: C.tomato, border: `1px solid ${C.tomato}33` },
  };
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium mb-1.5" style={{ color: C.sub }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full h-11 px-3 rounded-xl text-sm outline-none focus:ring-2 transition-all duration-150';
function inputStyle() { return { border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.text }; }

function Modal({ children, onClose, wide, topmost }) {
  return (
    <div className={`fixed inset-0 flex items-center justify-center p-2 sm:p-4 ${topmost ? 'z-[60]' : 'z-50'}`} style={{ backgroundColor: 'rgba(43,43,43,0.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`gm-modal w-full ${wide ? 'max-w-lg' : 'max-w-md'} overflow-y-auto`}
        style={{ backgroundColor: C.card, borderRadius: 20, boxShadow: '0 20px 50px rgba(43,43,43,0.18)' }}>
        {children}
      </div>
    </div>
  );
}

function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} topmost>
      <div className="p-6">
        <p className="text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
          <Btn variant="danger" onClick={() => { onConfirm(); onCancel(); }}>Confirmer</Btn>
        </div>
      </div>
    </Modal>
  );
}

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none">
      <path d="M50 4C26 4 8 22 8 46c0 32 42 78 42 78s42-46 42-78C92 22 74 4 50 4z" stroke={C.forest} strokeWidth="6" strokeLinejoin="round" />
      <path d="M50 42C50 60 50 75 50 92" stroke={C.primary} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M50 56C40 51 32 41 34 29 46 31 54 42 50 56Z" fill="#66BB6A" />
      <path d="M50 49C58 41 68 29 66 17 52 21 44 33 50 49Z" fill={C.primary} />
    </svg>
  );
}

function VersionBadge({ onClick, className = '' }) {
  return (
    <button onClick={onClick} className={`text-[11px] px-2 py-0.5 rounded-full transition-all duration-150 hover:brightness-95 ${className}`}
      style={{ backgroundColor: C.bg, color: C.sub, border: `1px solid ${C.border}` }} title="Voir l'historique des mises à jour">
      v{APP_VERSION}
    </button>
  );
}

function ChangelogModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} color={C.forest} />
            <h3 className="gm-title text-base font-semibold">Historique des mises à jour</h3>
          </div>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <div className="space-y-5">
          {CHANGELOG.map((c) => (
            <div key={c.version}>
              <div className="text-sm font-semibold mb-1.5" style={{ color: C.forest }}>Version {c.version}</div>
              <ul className="text-sm space-y-1" style={{ color: C.sub }}>
                {c.changes.map((ch, i) => <li key={i}>• {ch}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Main App                                                             */
/* ------------------------------------------------------------------ */
export default function GrowMapApp() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('map');

  const [gardenMode, setGardenMode] = useState('plan');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(100);
  const [zones, setZones] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [elementTypes, setElementTypes] = useState(DEFAULT_ELEMENT_TYPES);

  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState({ name: '', defaultMode: 'plan', snapDefault: false, snapStep: 3, theme: 'light', language: 'fr' });
  const [customPlantLibrary, setCustomPlantLibrary] = useState({ potager: [], massif: [], haie: [] });
  const [hiddenDefaultPlants, setHiddenDefaultPlants] = useState({ potager: [], massif: [], haie: [] });
  // themeTick forces a re-render after applyTheme() mutates the shared C object in place.
  const [, setThemeTick] = useState(0);
  function setTheme(mode) { applyTheme(mode); setProfile((p) => ({ ...p, theme: mode })); setThemeTick((t) => t + 1); }

  // Drawing / placing
  const [drawingType, setDrawingType] = useState(null);
  const [drawPoints, setDrawPoints] = useState([]);
  const [placingMarkerType, setPlacingMarkerType] = useState(null);

  // Zone shape editing
  const [editingZone, setEditingZone] = useState(null); // { id, points }
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [draggingMarkerId, setDraggingMarkerId] = useState(null);
  const markerDragRef = useRef({ id: null, startX: 0, startY: 0, moved: false });

  // View (zoom / pan / snap)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [snapEnabled, setSnapEnabled] = useState(false);

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef({ down: false, moved: false, startX: 0, startY: 0, panStartX: 0, panStartY: 0 });

  // Modals / selections
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [elementForm, setElementForm] = useState(null); // { key|null, label, icon, color, fromMap }
  const [elementsLibraryOpen, setElementsLibraryOpen] = useState(false);
  const [plantLibraryOpen, setPlantLibraryOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [githubConfig, setGithubConfig] = useState({ token: '', owner: '', repo: '', branch: 'main', path: 'growmap-data.json', lastSync: null });
  const [githubStatus, setGithubStatus] = useState({ type: 'idle', message: '' });
  const [importError, setImportError] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Device identity for push notifications — generated once, kept local,
  // and never included in exports or GitHub sync (only the merged
  // subscription list is, so the reminder job can reach every device).
  const [deviceId, setDeviceId] = useState('');
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [pushSubscription, setPushSubscription] = useState(null);
  const [pushStatus, setPushStatus] = useState({ type: 'idle', message: '' });
  const [notifiedTaskIds, setNotifiedTaskIds] = useState([]);

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const snapStep = profile.snapStep || 5;

  /* ---------------- storage load ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const p = await storage.get('growmap:profile', false);
        if (p && p.value) {
          const d = JSON.parse(p.value);
          setProfile((prev) => ({ ...prev, ...d }));
          setSnapEnabled(!!d.snapDefault);
          applyTheme(d.theme || 'light');
        }
      } catch (e) {}
      try {
        const g = await storage.get('growmap:garden', false);
        if (g && g.value) {
          const d = JSON.parse(g.value);
          setGardenMode(d.mode || 'plan');
          setBackgroundImage(d.backgroundImage || null);
          setImageOpacity(typeof d.imageOpacity === 'number' ? d.imageOpacity : 100);
          setZones(d.zones || []);
          setMarkers(d.markers || []);
        }
      } catch (e) {}
      try {
        const el = await storage.get('growmap:elements', false);
        if (el && el.value) setElementTypes(JSON.parse(el.value));
      } catch (e) {}
      try {
        const pl = await storage.get('growmap:plantlibrary', false);
        if (pl && pl.value) setCustomPlantLibrary((prev) => ({ ...prev, ...JSON.parse(pl.value) }));
      } catch (e) {}
      try {
        const hp = await storage.get('growmap:plantlibraryhidden', false);
        if (hp && hp.value) setHiddenDefaultPlants((prev) => ({ ...prev, ...JSON.parse(hp.value) }));
      } catch (e) {}
      try {
        const gh = await storage.get('growmap:github', false);
        if (gh && gh.value) setGithubConfig((prev) => ({ ...prev, ...JSON.parse(gh.value) }));
      } catch (e) {}
      try {
        const dev = await storage.get('growmap:deviceid', false);
        if (dev && dev.value) setDeviceId(dev.value);
        else { const id = genId(); setDeviceId(id); storage.set('growmap:deviceid', id, false).catch(() => {}); }
      } catch (e) {}
      try {
        const ps = await storage.get('growmap:pushsub', false);
        if (ps && ps.value) setPushSubscription(JSON.parse(ps.value));
      } catch (e) {}
      try {
        const nt = await storage.get('growmap:notified', false);
        if (nt && nt.value) setNotifiedTaskIds(JSON.parse(nt.value));
      } catch (e) {}
      try {
        const t = await storage.get('growmap:tasks', false);
        if (t && t.value) setTasks(JSON.parse(t.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  /* ---------------- storage save (debounced) ---------------- */
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      storage.set('growmap:garden', JSON.stringify({ mode: gardenMode, backgroundImage, imageOpacity, zones, markers }), false).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [gardenMode, backgroundImage, imageOpacity, zones, markers, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:elements', JSON.stringify(elementTypes), false).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [elementTypes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:plantlibrary', JSON.stringify(customPlantLibrary), false).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [customPlantLibrary, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:plantlibraryhidden', JSON.stringify(hiddenDefaultPlants), false).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [hiddenDefaultPlants, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:github', JSON.stringify(githubConfig), false).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [githubConfig, loaded]);

  useEffect(() => {
    if (!loaded || !pushSubscription) return;
    storage.set('growmap:pushsub', JSON.stringify(pushSubscription), false).catch(() => {});
  }, [pushSubscription, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:notified', JSON.stringify(notifiedTaskIds), false).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [notifiedTaskIds, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => storage.set('growmap:tasks', JSON.stringify(tasks), false).catch(() => {}), 700);
    return () => clearTimeout(t);
  }, [tasks, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.set('growmap:profile', JSON.stringify(profile), false).catch(() => {});
  }, [profile, loaded]);

  /* ---------------- point dragging (zone edit mode) ---------------- */
  useEffect(() => {
    if (draggingPoint == null) return;
    function move(e) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;
      x = Math.min(100, Math.max(0, x)); y = Math.min(100, Math.max(0, y));
      if (snapEnabled) { const snapped = nearestSnapPoint(x, y, zones, null, snapStep); x = snapped.x; y = snapped.y; }
      setEditingZone((z) => (z ? { ...z, points: z.points.map((p, i) => (i === draggingPoint ? { x, y } : p)) } : z));
    }
    function up() { setDraggingPoint(null); }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [draggingPoint, snapEnabled, snapStep, zones]);

  /* ---------------- marker dragging (move an element on the map) ---------------- */
  function onMarkerMouseDown(e, id) {
    e.stopPropagation();
    markerDragRef.current = { id, startX: e.clientX, startY: e.clientY, moved: false };
    setDraggingMarkerId(id);
  }
  useEffect(() => {
    if (!draggingMarkerId) return;
    function move(e) {
      const ref = markerDragRef.current;
      const dx = e.clientX - ref.startX, dy = e.clientY - ref.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) ref.moved = true;
      if (ref.moved && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.min(100, Math.max(0, x)); y = Math.min(100, Math.max(0, y));
        setMarkers((ms) => ms.map((mk) => (mk.id === draggingMarkerId ? { ...mk, x, y } : mk)));
      }
    }
    function up() {
      if (!markerDragRef.current.moved) setSelectedMarkerId(markerDragRef.current.id);
      setDraggingMarkerId(null);
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [draggingMarkerId]);

  /* ---------------- coordinate helpers ---------------- */
  function clientToPercent(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.min(100, Math.max(0, x)); y = Math.min(100, Math.max(0, y));
    if (snapEnabled) return nearestSnapPoint(x, y, zones, drawPoints, snapStep);
    return { x, y };
  }

  function handleCanvasClick(e) {
    if (editingZone) return;
    const { x, y } = clientToPercent(e);
    if (drawingType) {
      setDrawPoints((p) => [...p, { x, y }]);
    } else if (placingMarkerType) {
      setMarkers((ms) => [...ms, { id: genId(), type: placingMarkerType, x, y, name: (elementTypes.find((t) => t.key === placingMarkerType) || {}).label || 'Élément' }]);
      setPlacingMarkerType(null);
    }
  }

  function onCanvasMouseDown(e) {
    dragRef.current = { down: true, moved: false, startX: e.clientX, startY: e.clientY, panStartX: pan.x, panStartY: pan.y };
  }
  function onCanvasMouseMove(e) {
    if (!dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
    if (dragRef.current.moved && !drawingType && !placingMarkerType && !editingZone) {
      setPan({ x: dragRef.current.panStartX + dx, y: dragRef.current.panStartY + dy });
    }
  }
  function onCanvasMouseUp(e) {
    if (dragRef.current.down && !dragRef.current.moved) handleCanvasClick(e);
    dragRef.current.down = false; dragRef.current.moved = false;
  }

  function handleWheel(e) {
    e.preventDefault();
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setZoom((z) => {
      const newZoom = Math.min(4, Math.max(1, z * factor));
      const canvasX = (cx - pan.x) / z, canvasY = (cy - pan.y) / z;
      setPan({ x: cx - canvasX * newZoom, y: cy - canvasY * newZoom });
      return newZoom;
    });
  }
  function zoomBy(factor) {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    setZoom((z) => {
      const newZoom = Math.min(4, Math.max(1, z * factor));
      const canvasX = (cx - pan.x) / z, canvasY = (cy - pan.y) / z;
      setPan({ x: cx - canvasX * newZoom, y: cy - canvasY * newZoom });
      return newZoom;
    });
  }
  function resetView() { setZoom(1); setPan({ x: 0, y: 0 }); }

  function finishZone() {
    const cfg = ZONE_TYPES[drawingType];
    const minPoints = cfg.shape === 'line' ? 2 : 3;
    if (drawPoints.length < minPoints) return;
    const count = zones.filter((z) => z.type === drawingType).length + 1;
    setZones((z) => [...z, { id: genId(), type: drawingType, name: `${cfg.label} ${count}`, points: drawPoints, plants: [] }]);
    setDrawingType(null); setDrawPoints([]);
  }
  function cancelDrawing() { setDrawingType(null); setDrawPoints([]); }

  function centroid(points) {
    const n = points.length;
    return { x: points.reduce((a, p) => a + p.x, 0) / n, y: points.reduce((a, p) => a + p.y, 0) / n };
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 1600;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setBackgroundImage(canvas.toDataURL('image/jpeg', 0.82));
        setGardenMode('photo');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateZone(id, patch) { setZones((zs) => zs.map((z) => (z.id === id ? { ...z, ...patch } : z))); }
  function deleteZone(id) { setZones((zs) => zs.filter((z) => z.id !== id)); setSelectedZoneId(null); }
  function addPlant(zoneId, plant) { setZones((zs) => zs.map((z) => (z.id === zoneId ? { ...z, plants: [...z.plants, { id: genId(), ...plant }] } : z))); }
  function updatePlant(zoneId, plantId, patch) { setZones((zs) => zs.map((z) => (z.id === zoneId ? { ...z, plants: z.plants.map((p) => (p.id === plantId ? { ...p, ...patch } : p)) } : z))); }
  function deletePlant(zoneId, plantId) { setZones((zs) => zs.map((z) => (z.id === zoneId ? { ...z, plants: z.plants.filter((p) => p.id !== plantId) } : z))); }
  function deleteMarker(id) { setMarkers((ms) => ms.filter((m) => m.id !== id)); setSelectedMarkerId(null); }

  function startEditZone(zone) { setEditingZone({ id: zone.id, type: zone.type, points: zone.points.map((p) => ({ ...p })) }); setSelectedPointIndex(null); setSelectedZoneId(null); }
  function saveEditZone() { if (editingZone) updateZone(editingZone.id, { points: editingZone.points }); setEditingZone(null); setSelectedPointIndex(null); }
  function cancelEditZone() { setEditingZone(null); setSelectedPointIndex(null); }
  function deleteSelectedPoint() {
    if (!editingZone || selectedPointIndex == null) return;
    const minPoints = ZONE_TYPES[editingZone.type]?.shape === 'line' ? 2 : 3;
    if (editingZone.points.length <= minPoints) return;
    setEditingZone((z) => ({ ...z, points: z.points.filter((_, i) => i !== selectedPointIndex) }));
    setSelectedPointIndex(null);
  }
  function insertPointAfter(index) {
    setEditingZone((z) => {
      const next = z.points[(index + 1) % z.points.length];
      const cur = z.points[index];
      const mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
      const points = [...z.points.slice(0, index + 1), mid, ...z.points.slice(index + 1)];
      return { ...z, points };
    });
    setSelectedPointIndex(index + 1);
  }

  function saveElementType(form) {
    if (form.key) {
      setElementTypes((ts) => ts.map((t) => (t.key === form.key ? { ...t, label: form.label, icon: form.icon, color: form.color } : t)));
    } else {
      const key = genId();
      setElementTypes((ts) => [...ts, { key, label: form.label || 'Nouvel élément', icon: form.icon, color: form.color, builtin: false }]);
      if (form.fromMap) setPlacingMarkerType(key);
    }
    setElementForm(null);
  }
  function deleteElementType(key) {
    const used = markers.filter((m) => m.type === key).length;
    setConfirmDialog({
      message: used > 0 ? `Cet élément est utilisé par ${used} marqueur${used > 1 ? 's' : ''} sur la carte. Le supprimer effacera aussi ces marqueurs.` : 'Supprimer cet élément de la bibliothèque ?',
      onConfirm: () => { setElementTypes((ts) => ts.filter((t) => t.key !== key)); setMarkers((ms) => ms.filter((m) => m.type !== key)); },
    });
  }

  function exportData() {
    const payload = { exportedAt: new Date().toISOString(), version: APP_VERSION, garden: { mode: gardenMode, backgroundImage, imageOpacity, zones, markers }, elementTypes, customPlantLibrary, hiddenDefaultPlants, tasks, profile };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `growmap-export-${todayISO()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function importData(file) {
    setImportError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.garden) {
          setGardenMode(data.garden.mode || 'plan');
          setBackgroundImage(data.garden.backgroundImage || null);
          setImageOpacity(typeof data.garden.imageOpacity === 'number' ? data.garden.imageOpacity : 100);
          setZones(data.garden.zones || []);
          setMarkers(data.garden.markers || []);
        }
        if (data.elementTypes) setElementTypes(data.elementTypes);
        if (data.customPlantLibrary) setCustomPlantLibrary((prev) => ({ ...prev, ...data.customPlantLibrary }));
        if (data.hiddenDefaultPlants) setHiddenDefaultPlants((prev) => ({ ...prev, ...data.hiddenDefaultPlants }));
        if (data.tasks) setTasks(data.tasks);
        if (data.profile) setProfile((prev) => ({ ...prev, ...data.profile }));
      } catch (err) { setImportError("Le fichier sélectionné n'est pas un export GrowMap valide."); }
    };
    reader.readAsText(file);
  }

  function applyImportedPayload(data) {
    if (data.garden) {
      setGardenMode(data.garden.mode || 'plan');
      setBackgroundImage(data.garden.backgroundImage || null);
      setImageOpacity(typeof data.garden.imageOpacity === 'number' ? data.garden.imageOpacity : 100);
      setZones(data.garden.zones || []);
      setMarkers(data.garden.markers || []);
    }
    if (data.elementTypes) setElementTypes(data.elementTypes);
    if (data.customPlantLibrary) setCustomPlantLibrary((prev) => ({ ...prev, ...data.customPlantLibrary }));
    if (data.hiddenDefaultPlants) setHiddenDefaultPlants((prev) => ({ ...prev, ...data.hiddenDefaultPlants }));
    if (data.tasks) setTasks(data.tasks);
    if (data.profile) setProfile((prev) => ({ ...prev, ...data.profile }));
  }

  function b64EncodeUnicode(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64DecodeUnicode(str) { return decodeURIComponent(escape(atob(str.replace(/\n/g, '')))); }

  async function githubPush() {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
      setGithubStatus({ type: 'error', message: 'Renseignez le token, le propriétaire et le dépôt.' });
      return;
    }
    setGithubStatus({ type: 'loading', message: 'Envoi en cours…' });
    try {
      const base = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
      const headers = { Authorization: `Bearer ${githubConfig.token}`, Accept: 'application/vnd.github+json' };
      let sha;
      let existingSubscriptions = [];
      const getRes = await fetch(`${base}?ref=${encodeURIComponent(githubConfig.branch || 'main')}`, { headers });
      if (getRes.ok) {
        const d = await getRes.json();
        sha = d.sha;
        try {
          const existing = JSON.parse(b64DecodeUnicode(d.content));
          existingSubscriptions = existing.pushSubscriptions || [];
        } catch (e) {}
      } else if (getRes.status !== 404) { throw new Error(`Lecture impossible (${getRes.status})`); }

      // Merge this device's push subscription into the list instead of overwriting it,
      // so the reminder job can notify every device that has enabled background push.
      let pushSubscriptions = existingSubscriptions.filter((s) => s.deviceId !== deviceId);
      if (pushSubscription) pushSubscriptions.push({ deviceId, name: profile.name || 'Appareil', subscription: pushSubscription });

      const payload = { exportedAt: new Date().toISOString(), version: APP_VERSION, garden: { mode: gardenMode, backgroundImage, imageOpacity, zones, markers }, elementTypes, customPlantLibrary, hiddenDefaultPlants, tasks, profile, pushSubscriptions };
      const content = b64EncodeUnicode(JSON.stringify(payload, null, 2));
      const putRes = await fetch(base, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'GrowMap sync', content, branch: githubConfig.branch || 'main', ...(sha ? { sha } : {}) }),
      });
      if (!putRes.ok) throw new Error(`Échec de l'envoi (${putRes.status})`);
      setGithubStatus({ type: 'success', message: 'Données envoyées avec succès.' });
      setGithubConfig((c) => ({ ...c, lastSync: new Date().toISOString() }));
    } catch (e) {
      setGithubStatus({ type: 'error', message: e.message || 'Erreur réseau lors de la synchronisation.' });
    }
  }

  async function githubPull() {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
      setGithubStatus({ type: 'error', message: 'Renseignez le token, le propriétaire et le dépôt.' });
      return;
    }
    setGithubStatus({ type: 'loading', message: 'Récupération en cours…' });
    try {
      const base = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
      const headers = { Authorization: `Bearer ${githubConfig.token}`, Accept: 'application/vnd.github+json' };
      const res = await fetch(`${base}?ref=${encodeURIComponent(githubConfig.branch || 'main')}`, { headers });
      if (!res.ok) throw new Error(`Fichier introuvable (${res.status})`);
      const data = await res.json();
      const parsed = JSON.parse(b64DecodeUnicode(data.content));
      applyImportedPayload(parsed);
      setGithubStatus({ type: 'success', message: 'Données récupérées avec succès.' });
      setGithubConfig((c) => ({ ...c, lastSync: new Date().toISOString() }));
    } catch (e) {
      setGithubStatus({ type: 'error', message: e.message || 'Erreur réseau lors de la synchronisation.' });
    }
  }

  /* ---------------- notifications ---------------- */
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function requestNotifPermission() {
    if (typeof Notification === 'undefined') { setNotifPermission('unsupported'); return; }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  }

  async function subscribeToPush() {
    setPushStatus({ type: 'loading', message: 'Activation en cours…' });
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Les notifications push ne sont pas prises en charge par ce navigateur.');
      if (!profile.notifications?.vapidPublicKey) throw new Error('Renseignez votre clé publique VAPID (voir l\u2019aide).');
      if (Notification.permission !== 'granted') await requestNotifPermission();
      if (Notification.permission !== 'granted') throw new Error('Autorisation refusée par le navigateur.');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(profile.notifications.vapidPublicKey) });
      setPushSubscription(sub.toJSON());
      setPushStatus({ type: 'success', message: 'Notifications même app fermée activées sur cet appareil. Pensez à synchroniser (Envoyer) pour l\u2019enregistrer.' });
    } catch (e) {
      setPushStatus({ type: 'error', message: e.message || 'Impossible d\u2019activer les notifications push.' });
    }
  }

  async function unsubscribeFromPush() {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
    } catch (e) {}
    setPushSubscription(null);
    storage.delete('growmap:pushsub', false).catch(() => {});
    setPushStatus({ type: 'idle', message: 'Désactivées sur cet appareil. Synchronisez pour mettre à jour le dépôt.' });
  }

  // Local reminders: fire a browser notification for due tasks while the app
  // is open. This works without any server. For reminders while the app is
  // fully closed, see the optional GitHub Actions push setup in the help.
  function checkDueNotifications() {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const prefs = profile.notifications;
    if (!prefs?.enabled) return;
    const lead = prefs.leadDays || 0;
    const today = new Date(todayISO());
    const due = tasks.filter((t) => {
      if (t.done || notifiedTaskIds.includes(t.id)) return false;
      if (prefs.types && prefs.types[t.type] === false) return false;
      const diffDays = Math.round((new Date(t.date) - today) / 86400000);
      return diffDays === lead;
    });
    if (due.length === 0) return;
    due.forEach((t) => {
      try {
        new Notification('GrowMap', { body: t.title, icon: './icons/icon-192.png', tag: `growmap-${t.id}` });
      } catch (e) {}
    });
    setNotifiedTaskIds((ids) => [...ids, ...due.map((t) => t.id)]);
  }

  useEffect(() => {
    if (!loaded) return;
    checkDueNotifications();
    const interval = setInterval(checkDueNotifications, 5 * 60 * 1000);
    function onVisible() { if (document.visibilityState === 'visible') checkDueNotifications(); }
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, tasks, profile.notifications, notifiedTaskIds]);

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || null;
  const selectedMarker = markers.find((m) => m.id === selectedMarkerId) || null;
  const totalPlants = zones.reduce((a, z) => a + z.plants.length, 0);
  const upcoming = tasks.filter((t) => !t.done).sort((a, b) => a.date.localeCompare(b.date));
  const next7 = upcoming.filter((t) => { const diff = (new Date(t.date) - new Date(todayISO())) / 86400000; return diff >= 0 && diff <= 7; });

  const plantLibrary = useMemo(() => {
    const out = {};
    Object.keys(ZONE_TYPES).filter((k) => ZONE_TYPES[k].hasPlants).forEach((k) => {
      const defaults = PLANT_LIBRARY[k] || [];
      const visible = defaults.filter((n) => !(hiddenDefaultPlants[k] || []).includes(n));
      out[k] = [...visible, ...((customPlantLibrary[k]) || [])];
    });
    return out;
  }, [customPlantLibrary, hiddenDefaultPlants]);
  function addCustomPlant(type, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setCustomPlantLibrary((cl) => (cl[type]?.includes(trimmed) || plantLibrary[type]?.includes(trimmed) ? cl : { ...cl, [type]: [...(cl[type] || []), trimmed] }));
  }
  function removePlantFromLibrary(type, name) {
    if (PLANT_LIBRARY[type]?.includes(name)) {
      setHiddenDefaultPlants((hp) => ({ ...hp, [type]: [...(hp[type] || []), name] }));
    } else {
      setCustomPlantLibrary((cl) => ({ ...cl, [type]: (cl[type] || []).filter((n) => n !== name) }));
    }
  }
  const autoEntries = useMemo(() => {
    const list = [];
    zones.forEach((z) => z.plants.forEach((p) => {
      if (p.sowingStart) list.push({ id: `s-${p.id}`, zoneName: z.name, variety: p.variety, type: 'semis', start: p.sowingStart, end: p.sowingEnd || p.sowingStart });
      if (p.harvestStart) list.push({ id: `h-${p.id}`, zoneName: z.name, variety: p.variety, type: 'recolte', start: p.harvestStart, end: p.harvestEnd || p.harvestStart });
    }));
    return list;
  }, [zones]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg, fontFamily: 'Inter, sans-serif' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap'); html,body{background:${C.bg};}`}</style>
        <div className="flex flex-col items-center gap-3">
          <Logo size={40} />
          <span className="text-sm" style={{ color: C.sub }}>Chargement de ton jardin{profile.name ? `, ${profile.name}` : ''}…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: C.bg, fontFamily: 'Inter, sans-serif', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        html, body { background: ${C.bg}; }
        .gm-title { font-family: 'Poppins', sans-serif; }
        .gm-modal { max-height: 86vh; max-height: 86dvh; }
      `}</style>

      <header className="flex items-center justify-between px-5 md:px-8 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.card }}>
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="gm-title text-lg" style={{ fontWeight: 600 }}>
            <span style={{ color: C.forest }}>Grow</span><span style={{ color: C.primary }}>Map</span>
          </span>
          <VersionBadge className="ml-1" onClick={() => setChangelogOpen(true)} />
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[['map', 'Carte', MapIcon], ['calendar', 'Calendrier', CalendarIcon], ['dashboard', 'Tableau de bord', LayoutDashboard], ['profile', 'Profil', User]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 px-4 h-11 rounded-2xl text-sm font-medium transition-all duration-200"
              style={tab === id ? { backgroundColor: `${C.primary}1A`, color: C.forest } : { color: C.sub }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 md:px-8 py-5 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
        {tab === 'map' && (
          <MapTab
            gardenMode={gardenMode} setGardenMode={setGardenMode}
            backgroundImage={backgroundImage} imageOpacity={imageOpacity} setImageOpacity={setImageOpacity}
            fileInputRef={fileInputRef} handleImageUpload={handleImageUpload}
            zones={zones} markers={markers} elementTypes={elementTypes}
            drawingType={drawingType} setDrawingType={setDrawingType} drawPoints={drawPoints}
            placingMarkerType={placingMarkerType} setPlacingMarkerType={setPlacingMarkerType}
            editingZone={editingZone} selectedPointIndex={selectedPointIndex} setSelectedPointIndex={setSelectedPointIndex}
            setDraggingPoint={setDraggingPoint} deleteSelectedPoint={deleteSelectedPoint} insertPointAfter={insertPointAfter}
            saveEditZone={saveEditZone} cancelEditZone={cancelEditZone}
            zoom={zoom} pan={pan} snapEnabled={snapEnabled} setSnapEnabled={setSnapEnabled} snapStep={snapStep}
            viewportRef={viewportRef} canvasRef={canvasRef}
            onCanvasMouseDown={onCanvasMouseDown} onCanvasMouseMove={onCanvasMouseMove} onCanvasMouseUp={onCanvasMouseUp}
            handleWheel={handleWheel} zoomBy={zoomBy} resetView={resetView}
            finishZone={finishZone} cancelDrawing={cancelDrawing} centroid={centroid}
            openZone={setSelectedZoneId} openMarker={setSelectedMarkerId} onMarkerMouseDown={onMarkerMouseDown}
            openNewElement={() => setElementForm({ key: null, label: '', icon: 'sprout', color: C.primary, fromMap: true })}
          />
        )}
        {tab === 'calendar' && (
          <CalendarTab tasks={tasks} setTasks={setTasks} zones={zones} autoEntries={autoEntries}
            calendarMonth={calendarMonth} setCalendarMonth={setCalendarMonth}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate} askConfirm={setConfirmDialog} />
        )}
        {tab === 'dashboard' && (
          <DashboardTab zones={zones} markers={markers} totalPlants={totalPlants} tasks={tasks} next7={next7} setTab={setTab} openInventory={() => setInventoryOpen(true)} />
        )}
        {tab === 'profile' && (
          <ProfileTab
            profile={profile} setProfile={setProfile} setTheme={setTheme}
            openSettings={() => setSettingsOpen(true)}
            openChangelog={() => setChangelogOpen(true)}
            openElementsLibrary={() => setElementsLibraryOpen(true)}
            openPlantLibrary={() => setPlantLibraryOpen(true)}
          />
        )}
      </main>

      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; }} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 z-40" style={{ backgroundColor: C.card, borderTop: `1px solid ${C.border}` }}>
        {[['map', 'Carte', MapIcon], ['calendar', 'Agenda', CalendarIcon], ['dashboard', 'Bilan', LayoutDashboard], ['profile', 'Profil', User]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200" style={tab === id ? { color: C.forest } : { color: C.sub }}>
            <Icon size={20} /><span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {selectedZone && (
        <ZoneModal zone={selectedZone} onClose={() => setSelectedZoneId(null)}
          library={plantLibrary[selectedZone.type] || []}
          onUpdate={(patch) => updateZone(selectedZone.id, patch)}
          onDelete={() => setConfirmDialog({ message: `Supprimer la zone "${selectedZone.name}" et son contenu ?`, onConfirm: () => deleteZone(selectedZone.id) })}
          onAddPlant={(plant) => addPlant(selectedZone.id, plant)} onUpdatePlant={(pid, patch) => updatePlant(selectedZone.id, pid, patch)} onDeletePlant={(pid) => deletePlant(selectedZone.id, pid)}
          onEditShape={() => startEditZone(selectedZone)} />
      )}
      {selectedMarker && (
        <MarkerModal marker={selectedMarker} elementTypes={elementTypes} onClose={() => setSelectedMarkerId(null)}
          onRename={(name) => setMarkers((ms) => ms.map((m) => (m.id === selectedMarker.id ? { ...m, name } : m)))}
          onDelete={() => setConfirmDialog({ message: `Supprimer "${selectedMarker.name}" ?`, onConfirm: () => deleteMarker(selectedMarker.id) })} />
      )}
      {confirmDialog && <Confirm message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />}
      {changelogOpen && <ChangelogModal onClose={() => setChangelogOpen(false)} />}
      {settingsOpen && (
        <SettingsModal
          onOpenData={() => { setSettingsOpen(false); setDataModalOpen(true); }}
          onOpenGithub={() => { setSettingsOpen(false); setGithubStatus({ type: 'idle', message: '' }); setGithubModalOpen(true); }}
          onOpenNotifications={() => { setSettingsOpen(false); setNotificationsModalOpen(true); }}
          onOpenHelp={() => { setSettingsOpen(false); setHelpModalOpen(true); }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
      {dataModalOpen && (
        <DataModal exportData={exportData} importInputRef={importInputRef} importError={importError} askConfirm={setConfirmDialog}
          onReset={() => { setZones([]); setMarkers([]); setTasks([]); setBackgroundImage(null); setGardenMode('plan'); setElementTypes(DEFAULT_ELEMENT_TYPES); setCustomPlantLibrary({ potager: [], massif: [], haie: [] }); setHiddenDefaultPlants({ potager: [], massif: [], haie: [] }); }}
          onClose={() => setDataModalOpen(false)} />
      )}
      {githubModalOpen && (
        <GithubSyncModal config={githubConfig} setConfig={setGithubConfig} status={githubStatus} onPush={githubPush} onPull={githubPull}
          onOpenHelp={() => { setGithubModalOpen(false); setHelpModalOpen(true); }}
          onClose={() => setGithubModalOpen(false)} />
      )}
      {notificationsModalOpen && (
        <NotificationsModal profile={profile} setProfile={setProfile}
          notifPermission={notifPermission} requestNotifPermission={requestNotifPermission}
          pushSubscription={pushSubscription} pushStatus={pushStatus}
          onSubscribePush={subscribeToPush} onUnsubscribePush={unsubscribeFromPush}
          onOpenHelp={() => { setNotificationsModalOpen(false); setHelpModalOpen(true); }}
          onClose={() => setNotificationsModalOpen(false)} />
      )}
      {elementForm && <ElementFormModal form={elementForm} setForm={setElementForm} onSave={saveElementType} onClose={() => setElementForm(null)} />}
      {elementsLibraryOpen && (
        <ElementsLibraryModal elementTypes={elementTypes} openNewElement={() => { setElementsLibraryOpen(false); setElementForm({ key: null, label: '', icon: 'sprout', color: C.primary, fromMap: false }); }}
          openEditElement={(t) => { setElementsLibraryOpen(false); setElementForm({ key: t.key, label: t.label, icon: t.icon, color: t.color, fromMap: false }); }}
          deleteElementType={deleteElementType} onClose={() => setElementsLibraryOpen(false)} />
      )}
      {plantLibraryOpen && (
        <PlantLibraryModal plantLibrary={plantLibrary} customPlantLibrary={customPlantLibrary} onAdd={addCustomPlant} onRemove={removePlantFromLibrary} onClose={() => setPlantLibraryOpen(false)} />
      )}
      {inventoryOpen && (
        <InventoryModal zones={zones} markers={markers} elementTypes={elementTypes}
          onOpenZone={(id) => { setInventoryOpen(false); setSelectedZoneId(id); }}
          onOpenMarker={(id) => { setInventoryOpen(false); setSelectedMarkerId(id); }}
          onClose={() => setInventoryOpen(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Map tab                                                              */
/* ------------------------------------------------------------------ */
function MapTab(props) {
  const {
    gardenMode, setGardenMode, backgroundImage, imageOpacity, setImageOpacity, fileInputRef, handleImageUpload,
    zones, markers, elementTypes, drawingType, setDrawingType, drawPoints, placingMarkerType, setPlacingMarkerType,
    editingZone, selectedPointIndex, setSelectedPointIndex, setDraggingPoint, deleteSelectedPoint, insertPointAfter, saveEditZone, cancelEditZone,
    zoom, pan, snapEnabled, setSnapEnabled, snapStep, viewportRef, canvasRef,
    onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp, handleWheel, zoomBy, resetView,
    finishZone, cancelDrawing, centroid, openZone, openMarker, onMarkerMouseDown, openNewElement,
  } = props;
  const busy = !!drawingType || !!placingMarkerType || !!editingZone;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <button onClick={() => setGardenMode('plan')} className="h-11 px-4 text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
            style={gardenMode === 'plan' ? { backgroundColor: C.primary, color: '#fff' } : { backgroundColor: C.card, color: C.sub }}><Grid3x3 size={16} /> Plan</button>
          <button onClick={() => (backgroundImage ? setGardenMode('photo') : fileInputRef.current.click())} className="h-11 px-4 text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
            style={gardenMode === 'photo' ? { backgroundColor: C.primary, color: '#fff' } : { backgroundColor: C.card, color: C.sub }}><ImageIcon size={16} /> Photo</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {gardenMode === 'photo' && <Btn variant="outline" onClick={() => fileInputRef.current.click()}><Upload size={16} /> Changer l'image</Btn>}
        {gardenMode === 'photo' && backgroundImage && (
          <div className="flex items-center gap-2 h-11 px-3 rounded-2xl" style={{ border: `1px solid ${C.border}` }}>
            <span className="text-xs font-medium" style={{ color: C.sub }}>Opacité</span>
            <input type="range" min="20" max="100" value={imageOpacity} onChange={(e) => setImageOpacity(Number(e.target.value))} className="w-24" />
            <span className="text-xs w-8" style={{ color: C.sub }}>{imageOpacity}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Object.entries(ZONE_TYPES).map(([key, z]) => (
          <button key={key} disabled={busy && drawingType !== key} onClick={() => setDrawingType(drawingType === key ? null : key)}
            className="h-11 px-4 rounded-2xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200 disabled:opacity-30"
            style={drawingType === key ? { backgroundColor: z.color, color: '#fff' } : { backgroundColor: C.card, color: C.text, border: `1px solid ${C.border}` }}>
            <z.icon size={16} /> {z.label}
          </button>
        ))}
        <select disabled={!!drawingType || !!editingZone} value={placingMarkerType || ''}
          onChange={(e) => {
            if (e.target.value === '__create__') { openNewElement(); return; }
            setPlacingMarkerType(e.target.value || null);
          }}
          className="h-11 pl-4 pr-8 rounded-2xl text-sm font-medium disabled:opacity-30" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.text }}>
          <option value="">+ Élément…</option>
          <option value="__create__">➕ Créer un élément…</option>
          {elementTypes.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        {(drawingType || editingZone) && (
          <button onClick={() => setSnapEnabled((s) => !s)} title="Points d'accroche entre zones"
            className="h-11 px-4 rounded-2xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
            style={snapEnabled ? { backgroundColor: C.forest, color: '#fff' } : { backgroundColor: C.card, color: C.sub, border: `1px solid ${C.border}` }}>
            <Magnet size={16} /> Accroche
          </button>
        )}
      </div>

      <div ref={viewportRef} className="relative w-full rounded-[20px] overflow-hidden select-none" style={{ aspectRatio: '16/10', border: `1px solid ${C.border}`, backgroundColor: C.card }}
        onWheel={handleWheel}>
        <div
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown} onMouseMove={onCanvasMouseMove} onMouseUp={onCanvasMouseUp}
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0',
            cursor: busy ? 'crosshair' : (zoom > 1 ? 'grab' : 'default'),
            backgroundImage: gardenMode === 'plan' ? 'linear-gradient(#E8ECE7 1px, transparent 1px), linear-gradient(90deg, #E8ECE7 1px, transparent 1px)' : 'none',
            backgroundSize: '32px 32px', backgroundColor: C.card,
          }}
        >
          {gardenMode === 'photo' && backgroundImage && (
            <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: imageOpacity / 100 }} />
          )}
          {gardenMode === 'photo' && !backgroundImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <ImageIcon size={28} style={{ color: C.sub }} />
              <span className="text-sm" style={{ color: C.sub }}>Aucune image importée</span>
              <Btn variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}><Upload size={16} /> Importer une photo</Btn>
            </div>
          )}

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
            {zones.map((z) => {
              const isEditing = editingZone && editingZone.id === z.id;
              const pts = isEditing ? editingZone.points : z.points;
              const isLine = ZONE_TYPES[z.type]?.shape === 'line';
              const Shape = isLine ? 'polyline' : 'polygon';
              return (
                <Shape key={z.id} points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill={ZONE_TYPES[z.type].fill} stroke={ZONE_TYPES[z.type].color}
                  strokeWidth={isEditing ? '0.8' : (isLine ? '0.9' : '0.6')} strokeDasharray="none" strokeLinecap="round"
                  opacity={editingZone && !isEditing ? 0.85 : 1}
                  vectorEffect="non-scaling-stroke"
                  style={{ pointerEvents: busy && !isEditing ? 'none' : (editingZone ? 'none' : 'auto'), cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); if (!busy) openZone(z.id); }} />
              );
            })}
            {snapEnabled && (drawingType || editingZone) && zones.map((z) => z.points.map((p, i) => (
              <circle key={`${z.id}-${i}`} cx={p.x} cy={p.y} r="0.7" fill="none" stroke={C.forest} strokeWidth="0.35" vectorEffect="non-scaling-stroke" opacity="0.6" />
            )))}
            {drawingType && drawPoints.length > 0 && (
              <>
                <polyline points={drawPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={ZONE_TYPES[drawingType].color} strokeWidth="0.6" strokeDasharray="1.5,1" vectorEffect="non-scaling-stroke" />
                {ZONE_TYPES[drawingType].shape !== 'line' && drawPoints.length >= 3 && <line x1={drawPoints[drawPoints.length - 1].x} y1={drawPoints[drawPoints.length - 1].y} x2={drawPoints[0].x} y2={drawPoints[0].y} stroke={ZONE_TYPES[drawingType].color} strokeWidth="0.4" strokeDasharray="1,1" vectorEffect="non-scaling-stroke" opacity="0.5" />}
                {drawPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="0.9" fill={ZONE_TYPES[drawingType].color} />)}
              </>
            )}
          </svg>

          {zones.map((z) => {
            if (editingZone && editingZone.id === z.id) return null;
            const c = centroid(z.points);
            const Icon = ZONE_TYPES[z.type].icon;
            return (
              <div key={z.id} onClick={(e) => { e.stopPropagation(); if (!busy) openZone(z.id); }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium shadow-sm cursor-pointer"
                style={{ left: `${c.x}%`, top: `${c.y}%`, backgroundColor: C.card, color: ZONE_TYPES[z.type].color, border: `1px solid ${ZONE_TYPES[z.type].color}55`, pointerEvents: busy ? 'none' : 'auto', opacity: editingZone ? 0.85 : 1 }}>
                <Icon size={12} /> {z.name}
              </div>
            );
          })}

          {!editingZone && markers.map((m) => {
            const t = elementTypes.find((et) => et.key === m.type);
            if (!t) return null;
            const Icon = getIcon(t.icon);
            return (
              <div key={m.id} onMouseDown={(e) => { if (!busy) onMarkerMouseDown(e, m.id); }}
                className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${m.x}%`, top: `${m.y}%`, pointerEvents: busy ? 'none' : 'auto', cursor: busy ? 'default' : 'grab' }}>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: t.color }}><Icon size={16} color="#fff" /></div>
                  <div className="w-1.5 h-1.5 rounded-full -mt-0.5" style={{ backgroundColor: t.color }} />
                </div>
              </div>
            );
          })}

          {editingZone && editingZone.points.map((p, i, arr) => {
            const isLineEdit = ZONE_TYPES[editingZone.type]?.shape === 'line';
            const isLastOfLine = isLineEdit && i === arr.length - 1;
            const next = arr[(i + 1) % arr.length];
            const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
            return (
              <div key={i}>
                {!isLastOfLine && (
                  <div onClick={(e) => { e.stopPropagation(); insertPointAfter(i); }} title="Ajouter un point ici"
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ left: `${mid.x}%`, top: `${mid.y}%`, width: 14, height: 14, backgroundColor: C.card, border: `1.5px dashed ${C.primary}88` }}>
                    <Plus size={9} color={C.primary} />
                  </div>
                )}
                <div onMouseDown={(e) => { e.stopPropagation(); setSelectedPointIndex(i); setDraggingPoint(i); }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, width: 16, height: 16, backgroundColor: C.card, border: `3px solid ${selectedPointIndex === i ? C.tomato : C.forest}` }} />
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-2xl p-1 shadow-sm" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <button onClick={() => zoomBy(1 / 1.3)} className="w-9 h-9 rounded-xl flex items-center justify-center"><ZoomOut size={16} /></button>
          <span className="text-xs w-10 text-center" style={{ color: C.sub }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => zoomBy(1.3)} className="w-9 h-9 rounded-xl flex items-center justify-center"><ZoomIn size={16} /></button>
          <div className="w-px h-5" style={{ backgroundColor: C.border }} />
          <button onClick={resetView} className="w-9 h-9 rounded-xl flex items-center justify-center" title="Réinitialiser la vue"><Move size={16} /></button>
        </div>

        {zones.length === 0 && markers.length === 0 && !busy && zoom === 1 && (gardenMode === 'plan' || backgroundImage) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 text-center">
            <span className="text-sm" style={{ color: C.sub }}>Utilisez les boutons ci-dessus pour dessiner une zone (potager, massif, haie, bâtiment, clôture…) ou ajouter un élément.</span>
          </div>
        )}
      </div>

      {drawingType && (
        <div className="flex items-center justify-between gap-3 mt-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: `${ZONE_TYPES[drawingType].color}14`, border: `1px solid ${ZONE_TYPES[drawingType].color}33` }}>
          <span className="text-sm font-medium" style={{ color: ZONE_TYPES[drawingType].color }}>Cliquez sur la carte pour ajouter des points • {drawPoints.length} point{drawPoints.length > 1 ? 's' : ''}</span>
          <div className="flex gap-2"><Btn variant="ghost" onClick={cancelDrawing}><X size={16} /> Annuler</Btn><Btn variant="primary" disabled={drawPoints.length < (ZONE_TYPES[drawingType].shape === 'line' ? 2 : 3)} onClick={finishZone}><Check size={16} /> Terminer</Btn></div>
        </div>
      )}
      {placingMarkerType && (
        <div className="flex items-center justify-between gap-3 mt-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: `${C.sky}14`, border: `1px solid ${C.sky}33` }}>
          <span className="text-sm font-medium" style={{ color: C.sky }}>Cliquez sur la carte pour placer votre élément</span>
          <Btn variant="ghost" onClick={() => setPlacingMarkerType(null)}><X size={16} /> Annuler</Btn>
        </div>
      )}
      {editingZone && (
        <div className="flex items-center justify-between gap-3 mt-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: `${C.forest}14`, border: `1px solid ${C.forest}33` }}>
          <span className="text-sm font-medium" style={{ color: C.forest }}>Glissez un point pour le déplacer, ou cliquez sur un « + » pour en ajouter un.</span>
          <div className="flex gap-2">
            <Btn variant="ghost" disabled={selectedPointIndex == null || editingZone.points.length <= (ZONE_TYPES[editingZone.type]?.shape === 'line' ? 2 : 3)} onClick={deleteSelectedPoint}><Trash2 size={16} /> Supprimer le point</Btn>
            <Btn variant="ghost" onClick={cancelEditZone}><X size={16} /> Annuler</Btn>
            <Btn variant="primary" onClick={saveEditZone}><Check size={16} /> Enregistrer</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Element create/edit modal                                            */
/* ------------------------------------------------------------------ */
function ElementFormModal({ form, setForm, onSave, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">{form.key ? "Modifier l'élément" : 'Nouvel élément'}</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <Field label="Nom">
          <input className={inputCls} style={inputStyle()} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Ex : Pommier du fond" />
        </Field>
        <Field label="Couleur">
          <div className="flex flex-wrap gap-2">
            {ELEMENT_COLORS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-full" style={{ backgroundColor: c, border: form.color === c ? `3px solid ${C.text}` : '3px solid transparent' }} />
            ))}
          </div>
        </Field>
        <Field label="Icône">
          <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
            {ICON_LIBRARY.map((i) => (
              <button key={i.key} title={i.label} onClick={() => setForm({ ...form, icon: i.key })}
                className="aspect-square rounded-xl flex items-center justify-center"
                style={{ backgroundColor: form.icon === i.key ? `${form.color}22` : C.bg, border: `1.5px solid ${form.icon === i.key ? form.color : C.border}` }}>
                <i.icon size={17} color={form.icon === i.key ? form.color : C.sub} />
              </button>
            ))}
          </div>
        </Field>
        <div className="flex gap-2 justify-end mt-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" disabled={!form.label} onClick={() => onSave(form)}>{form.key ? 'Enregistrer' : 'Créer'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Zone modal                                                           */
/* ------------------------------------------------------------------ */
const emptyPlantForm = { variety: '', plantedDate: todayISO(), exposure: EXPOSURES[0], watering: WATER_NEEDS[0], sowingStart: '', sowingEnd: '', harvestStart: '', harvestEnd: '', notes: '' };

function ZoneModal({ zone, library, onClose, onUpdate, onDelete, onAddPlant, onUpdatePlant, onDeletePlant, onEditShape }) {
  const [name, setName] = useState(zone.name);
  const [showForm, setShowForm] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [form, setForm] = useState(emptyPlantForm);
  const meta = ZONE_TYPES[zone.type];
  const Icon = meta.icon;

  function openAddForm() { setEditingPlantId(null); setForm(emptyPlantForm); setShowForm(true); }
  function openEditForm(p) { setEditingPlantId(p.id); setForm({ ...emptyPlantForm, ...p }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingPlantId(null); setForm(emptyPlantForm); }
  function saveForm() {
    if (editingPlantId) onUpdatePlant(editingPlantId, form); else onAddPlant(form);
    closeForm();
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="sticky top-0 z-10 flex items-start justify-between px-6 pt-6 pb-4" style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}22` }}><Icon size={20} color={meta.color} /></div>
          <div className="flex-1 min-w-0">
            <input value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate({ name }); e.target.blur(); } if (e.key === 'Escape') { setName(zone.name); e.target.blur(); } }}
              className="gm-title text-base font-semibold outline-none rounded-lg px-2 py-1 -ml-2 w-full focus:ring-2"
              style={{ color: C.text, backgroundColor: C.bg, border: `1px solid ${C.border}` }} />
            {name !== zone.name && (
              <div className="flex gap-2 mt-1.5 ml-0.5">
                <button onClick={() => onUpdate({ name })} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary, color: '#fff' }}>Enregistrer</button>
                <button onClick={() => setName(zone.name)} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: C.sub }}>Annuler</button>
              </div>
            )}
            <div className="text-xs mt-1 ml-0.5" style={{ color: C.sub }}>{meta.label}{meta.hasPlants ? ` • ${zone.plants.length} plante${zone.plants.length !== 1 ? 's' : ''}` : ''}</div>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 ml-2"><X size={20} style={{ color: C.sub }} /></button>
      </div>

      <div className="p-6 pt-4">
        {!showForm && (
          <button onClick={onEditShape} className="text-xs font-medium mb-4 inline-flex items-center gap-1.5" style={{ color: C.primary }}>
            <Pencil size={13} /> Modifier la forme sur la carte
          </button>
        )}

        {meta.hasPlants ? (
          <>
            {!showForm && (
              <div className="space-y-2 mb-4">
                {zone.plants.length === 0 && <div className="text-sm py-6 text-center rounded-2xl" style={{ backgroundColor: C.bg, color: C.sub }}>Aucune plante dans cette zone pour l'instant.</div>}
                {zone.plants.map((p) => (
                  <button key={p.id} onClick={() => openEditForm(p)} className="w-full text-left p-3 rounded-2xl flex items-start justify-between gap-3 transition-all duration-150 hover:brightness-[0.98]" style={{ border: `1px solid ${C.border}` }}>
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">{p.variety} <Pencil size={11} style={{ color: C.sub }} /></div>
                      <div className="text-xs mt-0.5" style={{ color: C.sub }}>Planté le {p.plantedDate} • {p.exposure} • Arrosage {p.watering.toLowerCase()}</div>
                      {(p.sowingStart || p.harvestStart) && (
                        <div className="text-xs mt-0.5" style={{ color: C.sub }}>
                          {p.sowingStart && `Semis : ${MONTHS_FR[p.sowingStart - 1]}${p.sowingEnd && p.sowingEnd !== p.sowingStart ? ` – ${MONTHS_FR[p.sowingEnd - 1]}` : ''}`}
                          {p.sowingStart && p.harvestStart && ' • '}
                          {p.harvestStart && `Récolte : ${MONTHS_FR[p.harvestStart - 1]}${p.harvestEnd && p.harvestEnd !== p.harvestStart ? ` – ${MONTHS_FR[p.harvestEnd - 1]}` : ''}`}
                        </div>
                      )}
                      {p.notes && <div className="text-xs mt-1 italic truncate" style={{ color: C.sub }}>{p.notes}</div>}
                    </div>
                    <span onClick={(e) => { e.stopPropagation(); onDeletePlant(p.id); }} className="shrink-0 p-1"><Trash2 size={16} style={{ color: C.tomato }} /></span>
                  </button>
                ))}
              </div>
            )}

            {showForm ? (
              <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: C.bg }}>
                <div className="text-xs font-semibold mb-3" style={{ color: C.forest }}>{editingPlantId ? 'Modifier la plante' : 'Nouvelle plante'}</div>
                {library.length > 0 && (
                  <div className="mb-3">
                    <span className="block text-xs font-medium mb-1.5" style={{ color: C.sub }}>Ajout rapide depuis la bibliothèque</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                      {library.map((name) => (
                        <button key={name} onClick={() => setForm({ ...form, variety: name })} className="text-xs px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap" style={{ backgroundColor: form.variety === name ? meta.color : C.card, color: form.variety === name ? '#fff' : C.text, border: `1px solid ${form.variety === name ? meta.color : C.border}` }}>
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Field label="Variété">
                  <input className={inputCls} style={inputStyle()} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="Ex : Tomate cœur de bœuf" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date de plantation"><input type="date" className={inputCls} style={inputStyle()} value={form.plantedDate} onChange={(e) => setForm({ ...form, plantedDate: e.target.value })} /></Field>
                  <Field label="Exposition">
                    <select className={inputCls} style={inputStyle()} value={form.exposure} onChange={(e) => setForm({ ...form, exposure: e.target.value })}>
                      {EXPOSURES.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Besoin en eau">
                  <select className={inputCls} style={inputStyle()} value={form.watering} onChange={(e) => setForm({ ...form, watering: e.target.value })}>
                    {WATER_NEEDS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Semis — début">
                    <select className={inputCls} style={inputStyle()} value={form.sowingStart} onChange={(e) => setForm({ ...form, sowingStart: e.target.value ? Number(e.target.value) : '' })}>
                      <option value="">—</option>{MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Semis — fin">
                    <select className={inputCls} style={inputStyle()} value={form.sowingEnd} onChange={(e) => setForm({ ...form, sowingEnd: e.target.value ? Number(e.target.value) : '' })}>
                      <option value="">—</option>{MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Récolte — début">
                    <select className={inputCls} style={inputStyle()} value={form.harvestStart} onChange={(e) => setForm({ ...form, harvestStart: e.target.value ? Number(e.target.value) : '' })}>
                      <option value="">—</option>{MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Récolte — fin">
                    <select className={inputCls} style={inputStyle()} value={form.harvestEnd} onChange={(e) => setForm({ ...form, harvestEnd: e.target.value ? Number(e.target.value) : '' })}>
                      <option value="">—</option>{MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Notes"><textarea className={inputCls} style={{ ...inputStyle(), height: 70, paddingTop: 8 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
                <div className="flex gap-2 justify-end">
                  <Btn variant="ghost" onClick={closeForm}>Annuler</Btn>
                  <Btn variant="primary" disabled={!form.variety} onClick={saveForm}>{editingPlantId ? 'Enregistrer' : 'Ajouter la plante'}</Btn>
                </div>
              </div>
            ) : (
              <Btn variant="outline" className="w-full mb-4" onClick={openAddForm}><Plus size={16} /> Ajouter une plante</Btn>
            )}
          </>
        ) : (
          <ZoneNotes zone={zone} onUpdate={onUpdate} />
        )}

        <Btn variant="danger" className="w-full" onClick={onDelete}><Trash2 size={16} /> Supprimer cette zone</Btn>
      </div>
    </Modal>
  );
}

function ZoneNotes({ zone, onUpdate }) {
  const [notes, setNotes] = useState(zone.notes || '');
  return (
    <div className="mb-4">
      <Field label="Description (type de clôture, matériau, remarques…)">
        <textarea className={inputCls} style={{ ...inputStyle(), height: 90, paddingTop: 8 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex : Grillage rigide, 1,20 m, posé en 2022" />
      </Field>
      {notes !== (zone.notes || '') && (
        <div className="flex gap-2 -mt-2">
          <button onClick={() => onUpdate({ notes })} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary, color: '#fff' }}>Enregistrer</button>
          <button onClick={() => setNotes(zone.notes || '')} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: C.sub }}>Annuler</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marker modal                                                         */
/* ------------------------------------------------------------------ */
function MarkerModal({ marker, elementTypes, onClose, onRename, onDelete }) {
  const [name, setName] = useState(marker.name);
  const t = elementTypes.find((et) => et.key === marker.type) || { label: 'Élément', color: C.sub, icon: 'package' };
  const Icon = getIcon(t.icon);
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${t.color}22` }}><Icon size={20} color={t.color} /></div>
            <span className="text-xs" style={{ color: C.sub }}>{t.label}</span>
          </div>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <Field label="Nom">
          <input className={inputCls} style={inputStyle()} value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { onRename(name); e.target.blur(); } if (e.key === 'Escape') { setName(marker.name); e.target.blur(); } }} />
        </Field>
        {name !== marker.name && (
          <div className="flex gap-2 -mt-2 mb-4">
            <button onClick={() => onRename(name)} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary, color: '#fff' }}>Enregistrer</button>
            <button onClick={() => setName(marker.name)} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: C.sub }}>Annuler</button>
          </div>
        )}
        <p className="text-xs mb-3" style={{ color: C.sub }}>Astuce : faites glisser cet élément directement sur la carte pour le déplacer. Pour changer son icône ou sa couleur, rendez-vous dans Profil → Bibliothèque d'éléments.</p>
        <Btn variant="danger" className="w-full mt-2" onClick={onDelete}><Trash2 size={16} /> Supprimer</Btn>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar tab                                                         */
/* ------------------------------------------------------------------ */
function CalendarTab({ tasks, setTasks, zones, autoEntries, calendarMonth, setCalendarMonth, selectedDate, setSelectedDate, askConfirm }) {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  const dateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const tasksFor = (day) => tasks.filter((t) => t.date === dateKey(day));
  const monthEntries = autoEntries.filter((e) => monthInRange(month + 1, e.start, e.end));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="gm-title text-lg font-semibold">{MONTHS_FR[month]} {year}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ border: `1px solid ${C.border}` }}><ChevronLeft size={16} /></button>
          <button onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="h-10 px-3 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.border}` }}>Aujourd'hui</button>
          <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ border: `1px solid ${C.border}` }}><ChevronRight size={16} /></button>
        </div>
      </div>

      {monthEntries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {monthEntries.map((e) => {
            const meta = TASK_TYPES[e.type];
            const Icon = meta.icon;
            return (
              <span key={e.id} className="text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5" style={{ backgroundColor: `${meta.color}14`, color: meta.color, border: `1px solid ${meta.color}33` }}>
                <Icon size={12} /> {meta.label} : {e.variety} <span style={{ color: C.sub }}>({e.zoneName})</span>
              </span>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">{DAYS_FR.map((d) => <div key={d} className="text-center text-xs font-medium py-1" style={{ color: C.sub }}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dt = tasksFor(day);
          const isToday = dateKey(day) === todayISO();
          return (
            <button key={i} onClick={() => setSelectedDate(dateKey(day))} className="aspect-square rounded-xl p-1.5 flex flex-col items-start gap-0.5 transition-all duration-200 hover:shadow-sm"
              style={{ backgroundColor: isToday ? `${C.primary}12` : C.card, border: `1px solid ${isToday ? C.primary : C.border}` }}>
              <span className="text-xs font-medium" style={{ color: isToday ? C.forest : C.text }}>{day}</span>
              <div className="flex flex-wrap gap-0.5">
                {dt.slice(0, 3).map((t) => { const Icon = TASK_TYPES[t.type].icon; return <Icon key={t.id} size={10} color={TASK_TYPES[t.type].color} style={{ opacity: t.done ? 0.35 : 1 }} />; })}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayModal date={selectedDate} tasks={tasks.filter((t) => t.date === selectedDate)} zones={zones} onClose={() => setSelectedDate(null)}
          onAdd={(task) => setTasks((ts) => [...ts, { id: genId(), date: selectedDate, done: false, ...task }])}
          onToggle={(id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))}
          onDelete={(id) => askConfirm({ message: 'Supprimer cette tâche ?', onConfirm: () => setTasks((ts) => ts.filter((t) => t.id !== id)) })} />
      )}
    </div>
  );
}

function DayModal({ date, tasks, zones, onClose, onAdd, onToggle, onDelete }) {
  const [showForm, setShowForm] = useState(tasks.length === 0);
  const [form, setForm] = useState({ title: '', type: 'arrosage', zoneId: '' });
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <div className="space-y-2 mb-4">
          {tasks.map((t) => {
            const meta = TASK_TYPES[t.type]; const Icon = meta.icon; const zone = zones.find((z) => z.id === t.zoneId);
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ border: `1px solid ${C.border}` }}>
                <button onClick={() => onToggle(t.id)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.done ? C.primary : C.card, border: `1.5px solid ${t.done ? C.primary : C.border}` }}>{t.done && <Check size={14} color="#fff" />}</button>
                <Icon size={16} color={meta.color} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? C.sub : C.text }}>{t.title}</div>
                  {zone && <div className="text-xs" style={{ color: C.sub }}>{zone.name}</div>}
                </div>
                <button onClick={() => onDelete(t.id)}><Trash2 size={15} style={{ color: C.tomato }} /></button>
              </div>
            );
          })}
        </div>
        {showForm ? (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
            <Field label="Titre de la tâche"><input className={inputCls} style={inputStyle()} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Arroser le potager" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select className={inputCls} style={inputStyle()} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{Object.entries(TASK_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
              <Field label="Zone concernée"><select className={inputCls} style={inputStyle()} value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}><option value="">—</option>{zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></Field>
            </div>
            <div className="flex gap-2 justify-end">
              {tasks.length > 0 && <Btn variant="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>}
              <Btn variant="primary" disabled={!form.title} onClick={() => { onAdd(form); setForm({ title: '', type: 'arrosage', zoneId: '' }); setShowForm(false); }}>Ajouter</Btn>
            </div>
          </div>
        ) : (<Btn variant="outline" className="w-full" onClick={() => setShowForm(true)}><Plus size={16} /> Ajouter une tâche</Btn>)}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard tab                                                        */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-5 rounded-[20px] flex items-center gap-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A` }}><Icon size={22} color={color} /></div>
      <div><div className="gm-title text-2xl font-semibold leading-none">{value}</div><div className="text-xs mt-1" style={{ color: C.sub }}>{label}</div></div>
    </div>
  );
}

function DashboardTab({ zones, markers, totalPlants, tasks, next7, setTab, openInventory }) {
  const potagers = zones.filter((z) => z.type === 'potager').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="gm-title text-lg font-semibold">Tableau de bord</h2>
        <button onClick={openInventory} className="text-xs font-medium flex items-center gap-1.5 h-9 px-3 rounded-full" style={{ color: C.primary, border: `1px solid ${C.primary}55` }}>
          <Leaf size={13} /> Mes plantations
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={MapIcon} label="Zones créées" value={zones.length} color={C.primary} />
        <StatCard icon={Leaf} label="Plantes suivies" value={totalPlants} color={C.forest} />
        <StatCard icon={Carrot} label="Potagers" value={potagers} color={C.harvest} />
        <StatCard icon={CalendarIcon} label="Tâches à venir (7j)" value={next7.length} color={C.sky} />
      </div>
      <div className="rounded-[20px] p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Prochaines tâches</h3>
          <button onClick={() => setTab('calendar')} className="text-xs font-medium" style={{ color: C.primary }}>Voir le calendrier</button>
        </div>
        {next7.length === 0 ? (
          <div className="text-sm py-8 text-center rounded-2xl" style={{ backgroundColor: C.bg, color: C.sub }}>Aucune tâche prévue dans les 7 prochains jours.</div>
        ) : (
          <div className="space-y-2">
            {next7.slice(0, 6).map((t) => { const meta = TASK_TYPES[t.type]; const Icon = meta.icon; return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: C.bg }}>
                <Icon size={16} color={meta.color} /><span className="text-sm flex-1">{t.title}</span>
                <span className="text-xs" style={{ color: C.sub }}>{new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            ); })}
          </div>
        )}
      </div>
      {zones.length === 0 && markers.length === 0 && (
        <div className="mt-6 p-5 rounded-[20px] flex items-center gap-4" style={{ backgroundColor: `${C.primary}0D`, border: `1px solid ${C.primary}33` }}>
          <Sprout size={22} color={C.primary} />
          <div className="flex-1"><div className="text-sm font-medium" style={{ color: C.forest }}>Votre jardin est encore vide</div><div className="text-xs mt-0.5" style={{ color: C.sub }}>Rendez-vous dans l'onglet Carte pour créer votre premier potager.</div></div>
          <Btn variant="primary" onClick={() => setTab('map')}>Ouvrir la carte</Btn>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings modal                                                       */
/* ------------------------------------------------------------------ */
function DataModal({ exportData, importInputRef, importError, askConfirm, onReset, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">Données</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.sub }}>Vos zones, éléments et tâches sont stockés sur cet appareil. Exportez-les régulièrement pour en garder une copie ou les transférer vers un autre appareil.</p>
        <div className="flex gap-2 mb-2">
          <Btn variant="outline" className="flex-1" onClick={exportData}><Download size={16} /> Exporter</Btn>
          <Btn variant="outline" className="flex-1" onClick={() => importInputRef.current.click()}><Upload size={16} /> Importer</Btn>
        </div>
        {importError && <p className="text-xs mb-3" style={{ color: C.tomato }}>{importError}</p>}
        <Btn variant="danger" className="w-full mt-2" onClick={() => askConfirm({ message: 'Réinitialiser toutes les données du jardin ? Cette action est irréversible.', onConfirm: onReset })}><RotateCcw size={16} /> Réinitialiser les données</Btn>
      </div>
    </Modal>
  );
}

function SettingsModal({ onOpenData, onOpenGithub, onOpenNotifications, onOpenHelp, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Settings size={18} color={C.forest} /><h3 className="gm-title text-base font-semibold">Réglages avancés</h3></div>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <div className="flex flex-col gap-2">
          <Btn variant="outline" className="w-full" onClick={onOpenData}><span className="flex items-center gap-2 flex-1"><Download size={16} /> Données (export / import)</span><ChevronRight size={16} /></Btn>
          <Btn variant="outline" className="w-full" onClick={onOpenGithub}><span className="flex items-center gap-2 flex-1"><History size={16} /> Synchronisation GitHub</span><ChevronRight size={16} /></Btn>
          <Btn variant="outline" className="w-full" onClick={onOpenNotifications}><span className="flex items-center gap-2 flex-1"><CalendarIcon size={16} /> Notifications</span><ChevronRight size={16} /></Btn>
          <Btn variant="outline" className="w-full" onClick={onOpenHelp}><span className="flex items-center gap-2 flex-1"><Info size={16} /> Aide : activer synchro & notifications</span><ChevronRight size={16} /></Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Help modal                                                           */
/* ------------------------------------------------------------------ */
function HelpStep({ n, title, children }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold" style={{ backgroundColor: `${C.primary}22`, color: C.forest }}>{n}</div>
      <div>
        <div className="text-sm font-medium mb-0.5">{title}</div>
        <div className="text-xs" style={{ color: C.sub }}>{children}</div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }) {
  const [tab, setTab] = useState('sync');
  return (
    <Modal onClose={onClose} wide>
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4" style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <h3 className="gm-title text-base font-semibold">Aide : synchro & notifications</h3>
        <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
      </div>
      <div className="p-6 pt-4">
        <div className="flex rounded-2xl overflow-hidden mb-5" style={{ border: `1px solid ${C.border}` }}>
          <button onClick={() => setTab('sync')} className="flex-1 h-10 text-sm font-medium" style={tab === 'sync' ? { backgroundColor: C.primary, color: '#fff' } : { color: C.sub }}>Synchronisation GitHub</button>
          <button onClick={() => setTab('notif')} className="flex-1 h-10 text-sm font-medium" style={tab === 'notif' ? { backgroundColor: C.primary, color: '#fff' } : { color: C.sub }}>Notifications</button>
        </div>

        {tab === 'sync' && (
          <div>
            <div className="p-3 rounded-2xl mb-4 flex items-start gap-2" style={{ backgroundColor: `${C.harvest}14`, border: `1px solid ${C.harvest}44` }}>
              <Info size={15} color={C.harvest} className="shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: C.text }}>Utilisez un dépôt <strong>séparé du site</strong> pour vos données, et gardez-le <strong>privé</strong> : le code de l'app n'a besoin d'aucun accès à vos plantations ou vos tâches.</p>
            </div>
            <HelpStep n="1" title="Créez un dépôt GitHub privé, distinct du site">
              Sur github.com, créez un nouveau dépôt en visibilité <strong>Private</strong> — par exemple <code>growmap-data</code>. Il ne doit contenir que ce que GrowMap y enverra, rien du code du site.
            </HelpStep>
            <HelpStep n="2" title="Créez un token d'accès">
              Allez dans Paramètres GitHub → Developer settings → Fine-grained tokens → Generate new token. Limitez-le à ce seul dépôt privé et donnez-lui la permission « Contents : Read and write ».
            </HelpStep>
            <HelpStep n="3" title="Renseignez les champs">
              Dans Profil → Réglages avancés → Synchronisation GitHub, collez le token, le nom d'utilisateur (owner), le nom du dépôt <strong>privé</strong>, la branche (souvent <code>main</code>) et un nom de fichier (par défaut <code>growmap-data.json</code>).
            </HelpStep>
            <HelpStep n="4" title="Envoyez, puis récupérez sur vos autres appareils">
              Cliquez sur « Envoyer » depuis l'appareil qui a vos données à jour. Sur un autre appareil, configurez les mêmes champs puis cliquez sur « Récupérer ».
            </HelpStep>
          </div>
        )}

        {tab === 'notif' && (
          <div>
            <HelpStep n="1" title="Autorisez les notifications">
              Dans Profil → Réglages avancés → Notifications, cliquez sur « Autoriser ». Ces rappels s'affichent tant que GrowMap est ouvert ou installé — aucune configuration supplémentaire n'est nécessaire.
            </HelpStep>
            <HelpStep n="2" title="(Optionnel) Rappels même application fermée">
              Pour recevoir un rappel même sans avoir ouvert GrowMap, il faut un « serveur » qui envoie la notification au bon moment. Ce job planifié doit vivre dans <strong>le dépôt privé de vos données</strong> (pas celui du site) — un job GitHub Actions ne peut lire que les fichiers de son propre dépôt. Le modèle prêt à l'emploi pour ce dépôt privé (dossier <code>growmap-data-repo</code>) vous a été fourni séparément.
            </HelpStep>
            <HelpStep n="3" title="Générez une paire de clés VAPID">
              Sur votre ordinateur, avec Node.js installé : <code>npx web-push generate-vapid-keys</code>. Vous obtenez une clé publique et une clé privée.
            </HelpStep>
            <HelpStep n="4" title="Configurez le dépôt privé de données">
              Dans ce dépôt privé (pas celui du site), ajoutez deux secrets (Settings → Secrets and variables → Actions → New repository secret) : <code>VAPID_PUBLIC_KEY</code> et <code>VAPID_PRIVATE_KEY</code>. Si vous avez choisi un autre nom de fichier que <code>growmap-data.json</code>, ajoutez aussi une variable <code>GROWMAP_DATA_PATH</code> avec ce nom. Le workflow qui s'y trouve tourne alors chaque jour et envoie les rappels dus.
            </HelpStep>
            <HelpStep n="5" title="Activez sur l'appareil">
              Collez la clé publique dans le champ « Clé publique VAPID » puis cliquez sur « Activer sur cet appareil ». Synchronisez ensuite (Envoyer) pour enregistrer l'abonnement dans le dépôt privé.
            </HelpStep>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* GitHub sync modal                                                    */
/* ------------------------------------------------------------------ */
function GithubSyncModal({ config, setConfig, status, onPush, onPull, onOpenHelp, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">Synchronisation GitHub</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.sub }}>
          Envoyez et récupérez vos données depuis un dépôt GitHub <strong>privé, séparé du dépôt qui héberge le site</strong>, pour les synchroniser entre plusieurs appareils. Utilisez un token à accès restreint (fine-grained), limité à ce seul dépôt — ce token reste stocké uniquement sur cet appareil et n'est jamais inclus dans vos exports.
          <button onClick={onOpenHelp} className="underline ml-1" style={{ color: C.primary }}>Voir le guide pas à pas</button>
        </p>

        <Field label="Token d'accès personnel GitHub">
          <input type="password" className={inputCls} style={inputStyle()} value={config.token} onChange={(e) => setConfig({ ...config, token: e.target.value })} placeholder="github_pat_…" autoComplete="off" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Propriétaire (owner)"><input className={inputCls} style={inputStyle()} value={config.owner} onChange={(e) => setConfig({ ...config, owner: e.target.value })} placeholder="ex : camille" /></Field>
          <Field label="Dépôt (repo)"><input className={inputCls} style={inputStyle()} value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })} placeholder="ex : growmap-data" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Branche"><input className={inputCls} style={inputStyle()} value={config.branch} onChange={(e) => setConfig({ ...config, branch: e.target.value })} placeholder="main" /></Field>
          <Field label="Chemin du fichier"><input className={inputCls} style={inputStyle()} value={config.path} onChange={(e) => setConfig({ ...config, path: e.target.value })} placeholder="growmap-data.json" /></Field>
        </div>

        {config.lastSync && <p className="text-xs mb-3" style={{ color: C.sub }}>Dernière synchronisation : {new Date(config.lastSync).toLocaleString('fr-FR')}</p>}
        {status.message && (
          <p className="text-xs mb-3" style={{ color: status.type === 'error' ? C.tomato : status.type === 'success' ? C.primary : C.sub }}>{status.message}</p>
        )}

        <div className="flex gap-2">
          <Btn variant="outline" className="flex-1" disabled={status.type === 'loading'} onClick={onPull}><Download size={16} style={{ transform: 'rotate(180deg)' }} /> Récupérer</Btn>
          <Btn variant="primary" className="flex-1" disabled={status.type === 'loading'} onClick={onPush}><Upload size={16} /> Envoyer</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications modal                                                  */
/* ------------------------------------------------------------------ */
function NotificationsModal({ profile, setProfile, notifPermission, requestNotifPermission, pushSubscription, pushStatus, onSubscribePush, onUnsubscribePush, onOpenHelp, onClose }) {
  const notif = profile.notifications || { enabled: false, types: {}, leadDays: 0, vapidPublicKey: '' };
  function update(patch) { setProfile({ ...profile, notifications: { ...notif, ...patch } }); }
  function toggleType(key) { update({ types: { ...notif.types, [key]: !notif.types?.[key] } }); }
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">Notifications</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>

        <div className="p-3 rounded-2xl mb-4 flex items-start gap-2" style={{ backgroundColor: `${C.sky}14`, border: `1px solid ${C.sky}44` }}>
          <Info size={15} color={C.sky} className="shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: C.text }}>
            Étape 1 : autorisez les notifications du navigateur. Étape 2 (optionnelle) : activez les rappels même app fermée.
            <button onClick={onOpenHelp} className="underline ml-1" style={{ color: C.sky }}>Voir le guide pas à pas</button>
          </p>
        </div>

        <Field label="Autorisation du navigateur">
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 h-11 rounded-xl flex items-center" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
              {notifPermission === 'granted' ? 'Autorisées' : notifPermission === 'denied' ? 'Refusées (à réactiver dans le navigateur)' : notifPermission === 'unsupported' ? 'Non prises en charge par ce navigateur' : 'Pas encore demandées'}
            </span>
            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <Btn variant="primary" onClick={requestNotifPermission}>Autoriser</Btn>
            )}
          </div>
        </Field>

        <Field label="Rappels de tâches">
          <div className="flex gap-2">
            <button onClick={() => update({ enabled: false })} className="flex-1 h-11 rounded-xl text-sm font-medium" style={!notif.enabled ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Désactivés</button>
            <button onClick={() => update({ enabled: true })} className="flex-1 h-11 rounded-xl text-sm font-medium" style={notif.enabled ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Activés</button>
          </div>
        </Field>

        {notif.enabled && (
          <>
            <Field label="Types de tâches concernées">
              <div className="flex flex-wrap gap-2">
                {Object.entries(TASK_TYPES).map(([key, meta]) => {
                  const active = notif.types?.[key] !== false;
                  const Icon = meta.icon;
                  return (
                    <button key={key} onClick={() => toggleType(key)} className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={active ? { backgroundColor: meta.color, color: '#fff' } : { border: `1px solid ${C.border}`, color: C.sub }}>
                      <Icon size={12} /> {meta.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Délai de rappel">
              <select className={inputCls} style={inputStyle()} value={notif.leadDays ?? 0} onChange={(e) => update({ leadDays: Number(e.target.value) })}>
                <option value={0}>Le jour même</option>
                <option value={1}>La veille</option>
                <option value={2}>2 jours avant</option>
              </select>
            </Field>
            <p className="text-xs mb-4" style={{ color: C.sub }}>Ces rappels s'affichent tant que GrowMap est ouvert dans un onglet ou installé — l'application vérifie régulièrement les tâches à venir.</p>
          </>
        )}

        <div className="mt-2 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <h4 className="text-sm font-semibold mb-1">Rappels même application fermée (avancé)</h4>
          <p className="text-xs mb-3" style={{ color: C.sub }}>Nécessite une clé VAPID et, pour une réception fiable, la tâche planifiée GitHub Actions décrite dans le guide.</p>
          <Field label="Clé publique VAPID">
            <input className={inputCls} style={inputStyle()} value={notif.vapidPublicKey || ''} onChange={(e) => update({ vapidPublicKey: e.target.value })} placeholder="Clé générée avec npx web-push generate-vapid-keys" />
          </Field>
          {pushStatus.message && (
            <p className="text-xs mb-3" style={{ color: pushStatus.type === 'error' ? C.tomato : pushStatus.type === 'success' ? C.primary : C.sub }}>{pushStatus.message}</p>
          )}
          {pushSubscription ? (
            <Btn variant="outline" className="w-full" onClick={onUnsubscribePush}>Désactiver sur cet appareil</Btn>
          ) : (
            <Btn variant="primary" className="w-full" disabled={!notif.vapidPublicKey} onClick={onSubscribePush}>Activer sur cet appareil</Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Elements library modal                                               */
/* ------------------------------------------------------------------ */
function ElementsLibraryModal({ elementTypes, openNewElement, openEditElement, deleteElementType, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">Bibliothèque d'éléments</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <Btn variant="outline" className="w-full mb-4" onClick={openNewElement}><Plus size={16} /> Nouvel élément</Btn>
        <div className="grid grid-cols-2 gap-2">
          {elementTypes.map((t) => {
            const Icon = getIcon(t.icon);
            return (
              <div key={t.key} className="p-3 rounded-2xl flex items-center gap-2" style={{ border: `1px solid ${C.border}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${t.color}22` }}><Icon size={15} color={t.color} /></div>
                <span className="text-xs flex-1 truncate">{t.label}</span>
                <button onClick={() => openEditElement(t)}><Pencil size={13} style={{ color: C.sub }} /></button>
                <button onClick={() => deleteElementType(t.key)}><Trash2 size={13} style={{ color: C.tomato }} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Plant library modal                                                  */
/* ------------------------------------------------------------------ */
function PlantLibraryModal({ plantLibrary, customPlantLibrary, onAdd, onRemove, onClose }) {
  const [drafts, setDrafts] = useState({ potager: '', massif: '', haie: '', batiment: '' });
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="gm-title text-base font-semibold">Bibliothèque de plantes</h3>
          <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.sub }}>Ces variétés apparaissent en ajout rapide lorsque vous ajoutez une plante à une zone. Ajoutez ou retirez librement des variétés ci-dessous.</p>
        {Object.entries(ZONE_TYPES).filter(([, meta]) => meta.hasPlants).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={type} className="mb-5">
              <div className="flex items-center gap-1.5 mb-2"><Icon size={14} color={meta.color} /><span className="text-xs font-semibold">{meta.label}</span></div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(plantLibrary[type] || []).length === 0 && <span className="text-xs" style={{ color: C.sub }}>Aucune variété — ajoutez-en une ci-dessous.</span>}
                {(plantLibrary[type] || []).map((name) => (
                  <span key={name} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    {name}
                    <button onClick={() => onRemove(type, name)}><X size={11} style={{ color: C.tomato }} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} style={inputStyle()} value={drafts[type]} onChange={(e) => setDrafts({ ...drafts, [type]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(type, drafts[type]); setDrafts({ ...drafts, [type]: '' }); } }}
                  placeholder="Ajouter une variété…" />
                <Btn variant="outline" onClick={() => { onAdd(type, drafts[type]); setDrafts({ ...drafts, [type]: '' }); }}><Plus size={16} /></Btn>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Inventory modal ("Mes plantations")                                  */
/* ------------------------------------------------------------------ */
function InventoryModal({ zones, markers, elementTypes, onOpenZone, onOpenMarker, onClose }) {
  const allPlants = zones.flatMap((z) => z.plants.map((p) => ({ ...p, zoneId: z.id, zoneName: z.name, zoneType: z.type })));
  return (
    <Modal onClose={onClose} wide>
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4" style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <h3 className="gm-title text-base font-semibold">Mes plantations</h3>
        <button onClick={onClose}><X size={20} style={{ color: C.sub }} /></button>
      </div>
      <div className="p-6 pt-4">
        <div className="text-xs font-semibold mb-2" style={{ color: C.sub }}>PLANTES EN ZONE ({allPlants.length})</div>
        {allPlants.length === 0 ? (
          <div className="text-sm py-6 text-center rounded-2xl mb-5" style={{ backgroundColor: C.bg, color: C.sub }}>Aucune plante enregistrée pour l'instant.</div>
        ) : (
          <div className="space-y-2 mb-5">
            {allPlants.map((p) => {
              const meta = ZONE_TYPES[p.zoneType]; const Icon = meta.icon;
              return (
                <button key={p.id} onClick={() => onOpenZone(p.zoneId)} className="w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-150 hover:brightness-[0.98]" style={{ border: `1px solid ${C.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}22` }}><Icon size={16} color={meta.color} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.variety}</div>
                    <div className="text-xs" style={{ color: C.sub }}>{p.zoneName}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="text-xs font-semibold mb-2" style={{ color: C.sub }}>ÉLÉMENTS ({markers.length})</div>
        {markers.length === 0 ? (
          <div className="text-sm py-6 text-center rounded-2xl" style={{ backgroundColor: C.bg, color: C.sub }}>Aucun élément placé pour l'instant.</div>
        ) : (
          <div className="space-y-2">
            {markers.map((m) => {
              const t = elementTypes.find((et) => et.key === m.type) || { label: 'Élément', color: C.sub, icon: 'package' };
              const Icon = getIcon(t.icon);
              return (
                <button key={m.id} onClick={() => onOpenMarker(m.id)} className="w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-150 hover:brightness-[0.98]" style={{ border: `1px solid ${C.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${t.color}22` }}><Icon size={16} color={t.color} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs" style={{ color: C.sub }}>{t.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Profile tab                                                          */
/* ------------------------------------------------------------------ */
function ProfileTab({ profile, setProfile, setTheme, openSettings, openChangelog, openElementsLibrary, openPlantLibrary }) {
  return (
    <div className="max-w-lg">
      <h2 className="gm-title text-lg font-semibold mb-5">Profil & préférences</h2>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">À propos de vous</h3>
        <Field label="Votre prénom">
          <input className={inputCls} style={inputStyle()} value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Ex : Camille" />
        </Field>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">Carte</h3>
        <Field label="Mode d'affichage par défaut">
          <div className="flex gap-2">
            <button onClick={() => setProfile({ ...profile, defaultMode: 'plan' })} className="flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={profile.defaultMode === 'plan' ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}`, color: C.text }}><Grid3x3 size={15} /> Plan</button>
            <button onClick={() => setProfile({ ...profile, defaultMode: 'photo' })} className="flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={profile.defaultMode === 'photo' ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}`, color: C.text }}><ImageIcon size={15} /> Photo</button>
          </div>
        </Field>
        <Field label="Points d'accroche activés par défaut">
          <div className="flex gap-2">
            <button onClick={() => setProfile({ ...profile, snapDefault: false })} className="flex-1 h-11 rounded-xl text-sm font-medium" style={!profile.snapDefault ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Désactivés</button>
            <button onClick={() => setProfile({ ...profile, snapDefault: true })} className="flex-1 h-11 rounded-xl text-sm font-medium" style={profile.snapDefault ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Activés</button>
          </div>
        </Field>
        <Field label="Distance d'accroche">
          <select className={inputCls} style={inputStyle()} value={profile.snapStep || 3} onChange={(e) => setProfile({ ...profile, snapStep: Number(e.target.value) })}>
            <option value={1.5}>Précis</option><option value={3}>Moyen</option><option value={5}>Large</option>
          </select>
        </Field>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">Apparence</h3>
        <Field label="Thème">
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className="flex-1 h-11 rounded-xl text-sm font-medium" style={profile.theme !== 'dark' ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Clair</button>
            <button onClick={() => setTheme('dark')} className="flex-1 h-11 rounded-xl text-sm font-medium" style={profile.theme === 'dark' ? { backgroundColor: C.primary, color: '#fff' } : { border: `1px solid ${C.border}` }}>Sombre</button>
          </div>
        </Field>
        <Field label="Langue">
          <select className={inputCls} style={inputStyle()} value={profile.language || 'fr'} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          {profile.language === 'en' && <p className="text-xs mt-1.5" style={{ color: C.sub }}>La traduction complète de l'interface arrivera dans une prochaine version — pour l'instant, seule votre préférence est enregistrée.</p>}
        </Field>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">Bibliothèques</h3>
        <div className="flex flex-col gap-2">
          <Btn variant="outline" className="w-full" onClick={openElementsLibrary}><span className="flex items-center gap-2 flex-1"><Package size={16} /> Bibliothèque d'éléments</span><ChevronRight size={16} /></Btn>
          <Btn variant="outline" className="w-full" onClick={openPlantLibrary}><span className="flex items-center gap-2 flex-1"><Leaf size={16} /> Bibliothèque de plantes</span><ChevronRight size={16} /></Btn>
        </div>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">Données</h3>
        <Btn variant="outline" className="w-full" onClick={openSettings}><span className="flex items-center gap-2 flex-1"><Settings size={16} /> Réglages avancés</span><ChevronRight size={16} /></Btn>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold mb-3">Fonctionnalités à venir</h3>
        <ul className="text-sm space-y-1.5" style={{ color: C.sub }}>
          <li>• Notifications de rappel</li><li>• Météo en temps réel</li><li>• Connexion à Home Assistant</li><li>• Journal photo</li>
        </ul>
      </div>

      <button onClick={openChangelog} className="w-full rounded-[20px] p-5 flex items-center gap-4 text-left transition-all duration-150 hover:brightness-[0.98]" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <Logo size={30} />
        <div className="flex-1">
          <div className="text-sm font-medium">GrowMap</div>
          <div className="text-xs" style={{ color: C.sub }}>Version {APP_VERSION} • Planifiez. Cultivez. Récoltez.</div>
        </div>
        <History size={16} style={{ color: C.sub }} />
      </button>
    </div>
  );
}
