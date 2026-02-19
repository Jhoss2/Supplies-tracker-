import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { ChevronRight, ArrowLeft, X, Camera, Trash2, Edit, ImageIcon, Download, ChevronLeft, ChevronRight as ChevronRightIcon, Upload, Monitor } from 'lucide-react';

// ============================================================================
// CONFIGURATION & THEME
// ============================================================================

const THEME = {
  black: '#000000',
  white: '#FFFFFF',
  grayButton: '#E0E0E0',
  blueStart: '#1E3A8A',
  redStart: '#B91C1C',
  redLight: '#DC2626',
  violet: '#8B5CF6',
};

const GRAYED_ROOMS = [
  'TOGUYENI', 'SALLE 15', 'SALLE 07', 'SALLE 16', 'SALLE 22', 'SALLE 23',
  'SALLE 04', 'SALLE 19', 'SALLE 18', 'SALLE 27', 'LAB B ROOM 3',
  'AMPHI R.2.A', 'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.2.C', 'AMPHI R.2.D',
];

const ROOMS_TOP = ['TOUR DU SAVOIR', 'TOGUYENI', 'SALLE 15', 'SALLE 05'];
const ROOMS_MIDDLE = [
  'SALLE 04', 'SALLE 06', 'SALLE 07', 'SALLE 16', 'SALLE 17', 'SALLE 18',
  'SALLE 19', 'SALLE 21', 'SALLE 22', 'SALLE 23', 'SALLE 26', 'SALLE 27',
  'LAB B ROOM 3', 'LAB ROOM 1', 'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.1', 'AMPHI R.2.A',
];
const ROOMS_BOT = ['AMPHI R.2.B', 'AMPHI R.2.C', 'AMPHI R.2.D', 'AMPHI R.4'];

const ITEMS_REQUIRING_QUANTITY = ['RALLONGE', 'CÂBLE HDMI', 'CÂBLE VGA', 'MICRO FILAIRE'];

const INITIAL_MATERIALS = [
  { id: '1', name: 'RALLONGE', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23666" x="10" y="40" width="80" height="20" rx="10"/%3E%3Ccircle fill="%23999" cx="20" cy="50" r="5"/%3E%3Ccircle fill="%23999" cx="80" cy="50" r="5"/%3E%3C/svg%3E' },
  { id: '2', name: 'CÂBLE HDMI', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23000" x="15" y="35" width="70" height="30" rx="5"/%3E%3Crect fill="%23666" x="20" y="40" width="60" height="20"/%3E%3C/svg%3E' },
  { id: '3', name: 'CÂBLE VGA', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23000" x="15" y="35" width="70" height="30" rx="5"/%3E%3Crect fill="%23666" x="20" y="40" width="60" height="20"/%3E%3C/svg%3E' },
  { id: '4', name: 'MICRO FILAIRE', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ccircle fill="%23666" cx="50" cy="30" r="12"/%3E%3Crect fill="%23000" x="45" y="42" width="10" height="40" rx="5"/%3E%3Crect fill="%23666" x="40" y="82" width="20" height="8" rx="4"/%3E%3C/svg%3E' },
  { id: '5', name: 'PROJECTEUR', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23555" x="10" y="20" width="80" height="50" rx="5"/%3E%3Ccircle fill="%23000" cx="50" cy="45" r="15"/%3E%3Crect fill="%23666" x="20" y="75" width="60" height="10" rx="3"/%3E%3C/svg%3E' },
  { id: '6', name: 'ÉCRAN LCD', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23000" x="15" y="15" width="70" height="50" rx="3"/%3E%3Crect fill="%23222" x="20" y="20" width="60" height="40"/%3E%3Crect fill="%23666" x="30" y="70" width="40" height="8" rx="2"/%3E%3C/svg%3E' },
  { id: '7', name: 'CLAVIER', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Crect fill="%23222" x="10" y="30" width="80" height="40" rx="3"/%3E%3Crect fill="%23444" x="15" y="35" width="70" height="30"/%3E%3C/svg%3E' },
  { id: '8', name: 'SOURIS', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Cellipse fill="%23555" cx="50" cy="50" rx="20" ry="28"/%3E%3Ccircle fill="%23666" cx="50" cy="35" r="4"/%3E%3C/svg%3E' },
];

// ============================================================================
// SQLITE STORAGE (Simulated with localStorage)
// ============================================================================

const SQLiteStorage = {
  init: () => {
    const existing = localStorage.getItem('supplies_materials');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('supplies_materials', JSON.stringify(INITIAL_MATERIALS));
    }
  },
  
  getMaterials: () => {
    const data = localStorage.getItem('supplies_materials');
    return data ? JSON.parse(data) : INITIAL_MATERIALS;
  },
  
  saveMaterials: (materials) => {
    localStorage.setItem('supplies_materials', JSON.stringify(materials));
  },
  
  getTransactions: () => {
    const data = localStorage.getItem('supplies_transactions');
    return data ? JSON.parse(data) : [];
  },
  
  saveTransactions: (transactions) => {
    localStorage.setItem('supplies_transactions', JSON.stringify(transactions));
  },
  
  getIdentities: () => {
    const data = localStorage.getItem('supplies_identities');
    return data ? JSON.parse(data) : [];
  },
  
  saveIdentities: (identities) => {
    localStorage.setItem('supplies_identities', JSON.stringify(identities));
  },
  
  getOccupiedRooms: () => {
    const data = localStorage.getItem('supplies_occupied_rooms');
    return data ? new Set(JSON.parse(data)) : new Set();
  },
  
  saveOccupiedRooms: (rooms) => {
    localStorage.setItem('supplies_occupied_rooms', JSON.stringify(Array.from(rooms)));
  },
};

// ============================================================================
// APP CONTEXT
// ============================================================================

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [occupiedRooms, setOccupiedRoomsState] = useState(new Set());
  const [studentInfo, setStudentInfo] = useState({ name: '', surname: '', filiere: '', cardPhoto: null });
  const [currentSelectedItems, setCurrentSelectedItems] = useState([]);
  const [duration, setDuration] = useState('');
  const [signature1, setSignature1] = useState(null);
  const [signatureFinal, setSignatureFinal] = useState(null);

  useEffect(() => {
    SQLiteStorage.init();
    setMaterials(SQLiteStorage.getMaterials());
    setTransactions(SQLiteStorage.getTransactions());
    setIdentities(SQLiteStorage.getIdentities());
    setOccupiedRoomsState(SQLiteStorage.getOccupiedRooms());
  }, []);

  useEffect(() => { SQLiteStorage.saveMaterials(materials); }, [materials]);
  useEffect(() => { SQLiteStorage.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { SQLiteStorage.saveIdentities(identities); }, [identities]);
  useEffect(() => { SQLiteStorage.saveOccupiedRooms(occupiedRooms); }, [occupiedRooms]);

  const addMaterial = (material) => setMaterials([...materials, material]);
  const removeMaterial = (id) => setMaterials(materials.filter(m => m.id !== id));
  const updateMaterial = (id, updates) => setMaterials(materials.map(m => m.id === id ? { ...m, ...updates } : m));

  const toggleItemSelection = (materialId, quantity = 1) => {
    const existing = currentSelectedItems.find(item => item.materialId === materialId);
    if (existing) {
      setCurrentSelectedItems(currentSelectedItems.filter(item => item.materialId !== materialId));
    } else {
      setCurrentSelectedItems([...currentSelectedItems, { materialId, quantity }]);
    }
  };

  const addTransaction = (transaction) => setTransactions([transaction, ...transactions]);
  const addIdentity = (identity) => setIdentities([identity, ...identities]);
  const removeIdentity = (id) => setIdentities(identities.filter(i => i.id !== id));

  const setRoomOccupied = (roomName, occupied) => {
    const newOccupied = new Set(occupiedRooms);
    if (occupied) newOccupied.add(roomName);
    else newOccupied.delete(roomName);
    setOccupiedRoomsState(newOccupied);
  };

  const resetCurrentSession = () => {
    setStudentInfo({ name: '', surname: '', filiere: '', cardPhoto: null });
    setCurrentSelectedItems([]);
    setDuration('');
    setSignature1(null);
    setSignatureFinal(null);
  };

  return (
    <AppContext.Provider value={{
      currentScreen, setCurrentScreen, currentRoom, setCurrentRoom,
      materials, addMaterial, removeMaterial, updateMaterial,
      studentInfo, setStudentInfo, currentSelectedItems, setCurrentSelectedItems, toggleItemSelection,
      duration, setDuration, signature1, setSignature1, signatureFinal, setSignatureFinal,
      transactions, addTransaction, identities, addIdentity, removeIdentity,
      occupiedRooms, setRoomOccupied, resetCurrentSession,
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const RoomButton = ({ text, onClick, occupied = false }) => {
  const isGrayed = GRAYED_ROOMS.includes(text);
  const shadow = isGrayed ? '0 0 10px 2px rgba(139, 92, 246, 0.6)' : '0 0 10px 2px rgba(220, 38, 38, 0.6)';
  
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: '10px',
        textTransform: 'uppercase',
        padding: '8px 12px',
        textAlign: 'center',
        lineHeight: '1.2',
        backgroundColor: isGrayed ? (occupied ? '#DC2626' : '#E0E0E0') : 'white',
        color: isGrayed ? (occupied ? 'white' : '#000000') : 'black',
        border: isGrayed ? '1px solid #999999' : '1px solid white',
        borderRadius: '20px',
        boxShadow: shadow,
        transition: 'all 150ms ease',
        cursor: 'pointer',
      }}
      className="active:scale-90"
    >
      {text}
    </button>
  );
};

const ActionButton = ({ text, onClick, isRed = true }) => (
  <button
    onClick={() => setTimeout(onClick, 150)}
    style={{
      width: '160px',
      height: '160px',
      margin: '8px',
      borderRadius: '25px',
      border: '2px solid white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
      background: isRed ? 'linear-gradient(to bottom, #B91C1C, #000000)' : 'linear-gradient(to bottom, #1E3A8A, #000000)',
      color: 'white',
      fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
      fontStyle: 'italic',
      fontWeight: 900,
      fontSize: '14px',
      textTransform: 'uppercase',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    }}
    className="active:scale-90"
  >
    {text}
  </button>
);

const StandardButton = ({ text, onClick, fullWidth = false }) => (
  <button
    onClick={() => setTimeout(onClick, 150)}
    style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '12px 24px',
      borderRadius: '20px',
      border: '1px solid white',
      background: 'linear-gradient(to bottom, #1E3A8A, #000000)',
      color: 'white',
      fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
      fontStyle: 'italic',
      fontWeight: 900,
      fontSize: '12px',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 150ms ease',
      boxShadow: '0 0 10px 2px rgba(220, 38, 38, 0.6)',
    }}
    className="active:scale-90"
  >
    {text}
  </button>
);

// ============================================================================
// SCREENS
// ============================================================================

const HomeScreen = () => {
  const { setCurrentScreen, occupiedRooms, setCurrentRoom } = useAppContext();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRoomClick = (roomName) => {
    setCurrentRoom(roomName);
    setCurrentScreen('room');
  };

  const handleSettingsClick = () => {
    setShowPasswordDialog(true);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = () => {
    if (password === 'U-AUBEN SUPPLIES TRACKER') {
      setShowPasswordDialog(false);
      setPassword('');
      setCurrentScreen('settings');
    } else {
      setPasswordError('Code incorrect');
      setPassword('');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={handleSettingsClick}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ChevronRight size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '36px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '24px' }}>
          PANNEAU D'ADMINISTRATION
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%', maxWidth: '1400px' }}>
          {ROOMS_TOP.map((room) => (
            <RoomButton key={room} text={room} onClick={() => handleRoomClick(room)} occupied={occupiedRooms.has(room)} />
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[0, 1, 2].map((rowIdx) => (
            <div key={`row-${rowIdx}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
              {ROOMS_MIDDLE.slice(rowIdx * 6, (rowIdx + 1) * 6).map((room) => (
                <RoomButton key={room} text={room} onClick={() => handleRoomClick(room)} occupied={occupiedRooms.has(room)} />
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%', maxWidth: '1400px' }}>
          {ROOMS_BOT.map((room) => (
            <RoomButton key={room} text={room} onClick={() => handleRoomClick(room)} occupied={occupiedRooms.has(room)} />
          ))}
        </div>
      </div>

      {showPasswordDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '2px solid white', borderRadius: '8px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>PARAMÈTRES</h2>
              <button onClick={() => setShowPasswordDialog(false)} style={{ background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>MOT DE PASSE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                style={{ width: '100%', padding: '8px', backgroundColor: '#333333', border: '1px solid #666666', borderRadius: '4px', color: 'white' }}
                placeholder="Entrez le mot de passe"
                autoFocus
              />
              {passwordError && <p style={{ color: '#FF6B6B', fontSize: '14px', marginTop: '8px' }}>{passwordError}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowPasswordDialog(false)}
                style={{ flex: 1, padding: '8px', backgroundColor: '#555555', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                ANNULER
              </button>
              <button
                onClick={handlePasswordSubmit}
                style={{ flex: 1, padding: '8px', background: 'linear-gradient(to bottom, #B91C1C, #000000)', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                VALIDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RoomScreen = () => {
  const { currentRoom, setCurrentScreen, setCurrentRoom, occupiedRooms } = useAppContext();
  const [showAdminButton, setShowAdminButton] = useState(false);
  const isRoomOccupied = currentRoom && occupiedRooms.has(currentRoom);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => { setCurrentRoom(null); setCurrentScreen('home'); }}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div onClick={() => setShowAdminButton(true)} style={{ position: 'absolute', top: 0, left: 0, width: '96px', height: '96px', zIndex: 30, cursor: 'pointer' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '36px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '32px' }}>
          {currentRoom}
        </h1>

        {isRoomOccupied && (
          <div style={{ padding: '12px 24px', backgroundColor: '#7a0000', border: '2px solid #DC2626', borderRadius: '8px' }}>
            <p style={{ color: '#FF9999', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontSize: '18px' }}>SALLE OCCUPÉE</p>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', maxWidth: '1000px' }}>
          <ActionButton text="PRENDRE DU MATÉRIEL" onClick={() => setCurrentScreen('identification')} isRed={true} />
          <ActionButton text="AJOUTER DU MATÉRIEL" onClick={() => setCurrentScreen('selection')} isRed={true} />
          <ActionButton text="LISTE DU MATÉRIEL" onClick={() => setCurrentScreen('materialList')} isRed={true} />
          <ActionButton text="SIGNATURE FINALE" onClick={() => setCurrentScreen('finalSignature')} isRed={true} />
        </div>
      </div>

      {showAdminButton && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: THEME.black, border: '4px solid white', borderRadius: '8px', padding: '48px' }}>
            <button
              onClick={() => setShowAdminButton(false)}
              style={{ padding: '24px 48px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', fontSize: '20px', background: 'linear-gradient(to bottom, #B91C1C, #000000)', border: '2px solid white', cursor: 'pointer' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const IdentificationScreen = () => {
  const { setCurrentScreen, studentInfo, setStudentInfo } = useAppContext();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [filiere, setFiliere] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Erreur acces camera:', error);
      alert('Impossible d\'acceder a la camera');
    }
  };

  const takePhoto = () => {
    if (!filiere.trim()) {
      alert('Veuillez remplir le champ Filiere');
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
        setPhotoTaken(true);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setCameraActive(false);
        }
        setStudentInfo({ ...studentInfo, filiere, cardPhoto: photoData });
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()); setCurrentScreen('room'); }}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900 }}>
          IDENTIFICATION
        </h1>

        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', aspectRatio: '16/9', backgroundColor: '#1a1a1a', border: '4px solid white', borderRadius: '8px', overflow: 'hidden' }}>
          {!photoTaken ? (
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={capturedPhoto} alt="Carte capturee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {cameraActive && <div style={{ position: 'absolute', inset: 0, border: '4px solid #FFFF00', pointerEvents: 'none' }} />}
        </div>

        {!photoTaken && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>FILIÈRE</label>
            <input
              type="text"
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}
              placeholder="Entrez votre filiere"
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {!photoTaken ? (
            <button
              onClick={takePhoto}
              style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #B91C1C, #000000)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Camera size={20} />
              PRENDRE PHOTO
            </button>
          ) : (
            <>
              <button
                onClick={() => { setPhotoTaken(false); setCapturedPhoto(null); setFiliere(''); startCamera(); }}
                style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #1E3A8A, #000000)', border: '2px solid white', cursor: 'pointer' }}
              >
                RECOMMENCER
              </button>
              <button
                onClick={() => setCurrentScreen('selection')}
                style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #B91C1C, #000000)', border: '2px solid white', cursor: 'pointer' }}
              >
                CONTINUER
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SelectionScreen = () => {
  const { materials, currentSelectedItems, setCurrentSelectedItems, setCurrentScreen, setDuration } = useAppContext();
  const [selectedForQuantity, setSelectedForQuantity] = useState(null);
  const [quantityInput, setQuantityInput] = useState('1');
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const isItemSelected = (materialId) => currentSelectedItems.some(item => item.materialId === materialId);

  const handleMaterialClick = (materialId, materialName) => {
    if (ITEMS_REQUIRING_QUANTITY.some(item => materialName.includes(item))) {
      setSelectedForQuantity(materialId);
      setQuantityInput('1');
    } else {
      toggleItemSelection(materialId);
    }
  };

  const toggleItemSelection = (materialId) => {
    const existing = currentSelectedItems.find(item => item.materialId === materialId);
    if (existing) {
      setCurrentSelectedItems(currentSelectedItems.filter(item => item.materialId !== materialId));
    } else {
      setCurrentSelectedItems([...currentSelectedItems, { materialId, quantity: 1 }]);
    }
  };

  const handleQuantityConfirm = () => {
    if (selectedForQuantity) {
      const quantity = parseInt(quantityInput) || 1;
      const existing = currentSelectedItems.find(item => item.materialId === selectedForQuantity);
      if (existing) {
        setCurrentSelectedItems(currentSelectedItems.map(item => item.materialId === selectedForQuantity ? { ...item, quantity } : item));
      } else {
        setCurrentSelectedItems([...currentSelectedItems, { materialId: selectedForQuantity, quantity }]);
      }
      setSelectedForQuantity(null);
      setQuantityInput('1');
    }
  };

  const handleValidate = () => {
    if (currentSelectedItems.length === 0) {
      alert('Veuillez selectionner au moins un materiel');
      return;
    }
    setShowDurationDialog(true);
  };

  const handleDurationConfirm = () => {
    if (!startTime || !endTime) {
      alert('Veuillez remplir les heures de debut et fin');
      return;
    }
    setDuration(`${startTime} - ${endTime}`);
    setShowDurationDialog(false);
    setCurrentScreen('signature1');
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('room')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '48px 16px', overflowY: 'auto' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '16px' }}>
          SÉLECTION DU MATÉRIEL
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '1000px' }}>
          {materials.map((material) => {
            const isSelected = isItemSelected(material.id);
            return (
              <button
                key={material.id}
                onClick={() => handleMaterialClick(material.id, material.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? '#DC2626' : '#666666'}`,
                  backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(100, 100, 100, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <div style={{ width: '80px', height: '80px', backgroundColor: '#333333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {material.image ? (
                    <img src={material.image} alt={material.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#999999', fontSize: '12px', textAlign: 'center' }}>Image</div>
                  )}
                </div>
                <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', textAlign: 'center', color: 'white' }}>
                  {material.name}
                </p>
                {isSelected && <div style={{ color: '#DC2626', fontSize: '18px' }}>✓</div>}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '32px', marginBottom: '16px' }}>
          <StandardButton text="VALIDER" onClick={handleValidate} fullWidth={false} />
        </div>
      </div>

      {selectedForQuantity && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '2px solid white', borderRadius: '8px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>QUANTITÉ</h2>
              <button onClick={() => setSelectedForQuantity(null)} style={{ background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="number"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                min="1"
                style={{ width: '100%', padding: '12px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedForQuantity(null)}
                style={{ flex: 1, padding: '8px', backgroundColor: '#555555', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                ANNULER
              </button>
              <button
                onClick={handleQuantityConfirm}
                style={{ flex: 1, padding: '8px', background: 'linear-gradient(to bottom, #B91C1C, #000000)', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showDurationDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '2px solid white', borderRadius: '8px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '24px' }}>DURÉE DU COURS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>HEURE DE DÉBUT</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>HEURE DE FIN</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDurationDialog(false)}
                style={{ flex: 1, padding: '8px', backgroundColor: '#555555', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                ANNULER
              </button>
              <button
                onClick={handleDurationConfirm}
                style={{ flex: 1, padding: '8px', background: 'linear-gradient(to bottom, #B91C1C, #000000)', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Signature1Screen = () => {
  const { setCurrentScreen, setSignature1 } = useAppContext();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleValidate = () => {
    if (!hasSignature) {
      alert('Veuillez signer dans le cadre');
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      setSignature1(signatureData);
      setCurrentScreen('home');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('selection')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900 }}>
          VEUILLEZ SIGNER DANS LE CADRE
        </h1>

        <div style={{ width: '100%', maxWidth: '600px' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ width: '100%', border: '4px solid white', borderRadius: '8px', cursor: 'crosshair', backgroundColor: '#333333' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={clearSignature}
            style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #1E3A8A, #000000)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={20} />
            EFFACER
          </button>
          <button
            onClick={handleValidate}
            style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #B91C1C, #000000)', border: '2px solid white', cursor: 'pointer' }}
          >
            VALIDER
          </button>
        </div>
      </div>
    </div>
  );
};

const FinalSignatureScreen = () => {
  const { setCurrentScreen, signature1, studentInfo, currentSelectedItems, materials, currentRoom, duration, addTransaction, addIdentity, setRoomOccupied, resetCurrentSession } = useAppContext();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleValidate = () => {
    if (!hasSignature) {
      alert('Veuillez signer dans le cadre');
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const signatureFinalData = canvas.toDataURL('image/png');

      const transaction = {
        id: Date.now().toString(),
        roomName: currentRoom || 'UNKNOWN',
        studentName: studentInfo.name,
        studentSurname: studentInfo.surname,
        filiere: studentInfo.filiere,
        duration: duration,
        timestamp: new Date().toLocaleString('fr-FR'),
        materials: currentSelectedItems.map(item => {
          const material = materials.find(m => m.id === item.materialId);
          return {
            materialId: item.materialId,
            materialName: material?.name || 'Unknown',
            quantity: item.quantity,
            taken: true,
          };
        }),
        signature1: signature1,
        signatureFinal: signatureFinalData,
      };

      addTransaction(transaction);

      if (studentInfo.cardPhoto) {
        addIdentity({
          id: Date.now().toString(),
          name: studentInfo.name,
          surname: studentInfo.surname,
          filiere: studentInfo.filiere,
          photo: studentInfo.cardPhoto,
          date: new Date().toLocaleDateString('fr-FR'),
        });
      }

      if (currentRoom) {
        setRoomOccupied(currentRoom, true);
      }

      resetCurrentSession();
      setCurrentScreen('home');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('room')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900 }}>
          SIGNATURE FINALE
        </h1>

        <div style={{ display: 'flex', gap: '32px', width: '100%', maxWidth: '1000px', justifyContent: 'center' }}>
          {signature1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>PREMIÈRE SIGNATURE</p>
              <img src={signature1} alt="Premiere signature" style={{ border: '2px solid white', borderRadius: '4px', width: '192px', height: '128px', objectFit: 'cover', opacity: 0.6 }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>SIGNATURE FINALE</p>
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ border: '4px solid white', borderRadius: '8px', cursor: 'crosshair', backgroundColor: '#333333', width: '192px', height: '128px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={clearSignature}
            style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #1E3A8A, #000000)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={20} />
            EFFACER
          </button>
          <button
            onClick={handleValidate}
            style={{ padding: '12px 24px', borderRadius: '8px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: 'white', background: 'linear-gradient(to bottom, #B91C1C, #000000)', border: '2px solid white', cursor: 'pointer' }}
          >
            VALIDER
          </button>
        </div>
      </div>
    </div>
  );
};

const MaterialListScreen = () => {
  const { materials, removeMaterial, updateMaterial, setCurrentScreen } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      updateMaterial(id, { name: editName });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce materiel ?')) {
      removeMaterial(id);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('room')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '48px 16px', overflowY: 'auto' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '16px' }}>
          LISTE DU MATÉRIEL
        </h1>

        {materials.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999999', paddingTop: '48px' }}>
            <p style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>Aucun materiel enregistre</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', width: '100%', maxWidth: '1000px' }}>
            {materials.map((material) => (
              <div key={material.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', border: '2px solid #666666', backgroundColor: '#1a1a1a' }}>
                <div style={{ width: '128px', height: '128px', backgroundColor: '#333333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {material.image ? (
                    <img src={material.image} alt={material.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#999999', fontSize: '12px', textAlign: 'center' }}>Image</div>
                  )}
                </div>

                {editingId === material.id ? (
                  <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white', fontSize: '12px' }}
                    />
                    <button
                      onClick={() => handleSaveEdit(material.id)}
                      style={{ padding: '8px 12px', backgroundColor: '#22AA22', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', textAlign: 'center' }}>
                    {material.name}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleEdit(material.id, material.name)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Edit size={14} />
                    MODIFIER
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Trash2 size={14} />
                    SUPPRIMER
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  const { setCurrentScreen } = useAppContext();

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('home')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '36px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '32px' }}>
          PARAMÈTRES
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', maxWidth: '1000px' }}>
          <ActionButton text="AJOUTER DU MATÉRIEL" onClick={() => setCurrentScreen('addMaterial')} isRed={true} />
          <ActionButton text="LISTE DU MATÉRIEL" onClick={() => setCurrentScreen('materialListAdmin')} isRed={true} />
          <ActionButton text="BASE DE DONNEES D'IDENTITÉ" onClick={() => setCurrentScreen('identityDatabase')} isRed={true} />
          <ActionButton text="HISTORIQUE DES TRANSACTIONS" onClick={() => setCurrentScreen('history')} isRed={true} />
        </div>
      </div>
    </div>
  );
};

const AddMaterialScreen = () => {
  const { addMaterial, setCurrentScreen } = useAppContext();
  const fileInputRef = useRef(null);
  const [materialName, setMaterialName] = useState('');
  const [materialImage, setMaterialImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setMaterialImage(imageData);
        setImagePreview(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMaterial = () => {
    if (!materialName.trim()) {
      alert('Veuillez entrer un nom de materiel');
      return;
    }
    if (!materialImage) {
      alert('Veuillez selectionner une image');
      return;
    }
    addMaterial({
      id: Date.now().toString(),
      name: materialName,
      image: materialImage,
    });
    setMaterialName('');
    setMaterialImage(null);
    setImagePreview(null);
    alert('Materiel ajoute avec succes');
    setCurrentScreen('settings');
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('settings')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900 }}>
          AJOUTER DU MATERIEL
        </h1>

        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '12px' }}>IMAGE</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', height: '160px', border: '4px dashed white', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: 'transparent', cursor: 'pointer', color: 'white', transition: 'all 150ms' }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Apercu" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <>
                  <ImageIcon size={40} />
                  <span style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>CLIQUEZ POUR SELECTIONNER</span>
                </>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>NOM DU MATERIEL</label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}
              placeholder="Entrez le nom du materiel"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', paddingTop: '16px' }}>
            <button
              onClick={() => setCurrentScreen('settings')}
              style={{ padding: '12px 24px', backgroundColor: '#555555', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer' }}
            >
              ANNULER
            </button>
            <button
              onClick={handleAddMaterial}
              style={{ padding: '12px 24px', background: 'linear-gradient(to bottom, #B91C1C, #000000)', color: 'white', border: '2px solid white', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Upload size={20} />
              AJOUTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const IdentityDatabaseScreen = () => {
  const { identities, removeIdentity, setCurrentScreen } = useAppContext();

  const handleDelete = (id) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette photo ?')) {
      removeIdentity(id);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('settings')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '48px 16px', overflowY: 'auto' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '16px' }}>
          BASE DE DONNEES D'IDENTITE
        </h1>

        {identities.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999999', paddingTop: '48px' }}>
            <p style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>Aucune photo enregistree</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%', maxWidth: '1200px' }}>
            {identities.map((identity) => (
              <div key={identity.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', border: '2px solid #666666', backgroundColor: '#1a1a1a' }}>
                <div style={{ width: '128px', height: '160px', backgroundColor: '#333333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={identity.photo} alt={`${identity.name} ${identity.surname}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>
                    {identity.name} {identity.surname}
                  </p>
                  <p style={{ fontSize: '11px', color: '#999999', marginTop: '4px' }}>
                    {identity.filiere}
                  </p>
                  <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>
                    {identity.date}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(identity.id)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                >
                  <Trash2 size={14} />
                  SUPPRIMER
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryScreen = () => {
  const { transactions, setCurrentScreen } = useAppContext();
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Aucune transaction a exporter');
      return;
    }

    let csv = 'Salle,Filiere,Nom Etudiant,Duree Cours,Materiel,Pris\n';
    transactions.forEach(transaction => {
      const materials = transaction.materials.map(m => `${m.materialName}(${m.taken ? 'OUI' : 'NON'})`).join('; ');
      csv += `${transaction.roomName},${transaction.filiere},${transaction.studentName} ${transaction.studentSurname},${transaction.duration},"${materials}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('settings')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <button
        onClick={handleExportCSV}
        style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Download size={24} />
        <span style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>EXPORT CSV</span>
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '48px 16px' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '16px' }}>
          HISTORIQUE DES TRANSACTIONS
        </h1>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999999', paddingTop: '48px' }}>
            <p style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>Aucune transaction enregistree</p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={() => handleScroll('left')}
              style={{ padding: '8px', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
            >
              <ChevronLeft size={32} />
            </button>

            <div
              ref={scrollContainerRef}
              style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: '16px', paddingBottom: '16px', scrollBehavior: 'smooth' }}
            >
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{ flexShrink: 0, width: '384px', padding: '16px', border: '2px solid #666666', borderRadius: '8px', backgroundColor: '#1a1a1a' }}
                >
                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #666666' }}>
                    <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', color: '#DC2626' }}>
                      {transaction.roomName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#999999', marginTop: '4px' }}>
                      {transaction.timestamp}
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #666666' }}>
                    <p style={{ fontSize: '11px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>
                      {transaction.studentName} {transaction.studentSurname}
                    </p>
                    <p style={{ fontSize: '11px', color: '#999999', marginTop: '4px' }}>
                      {transaction.filiere}
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #666666' }}>
                    <p style={{ fontSize: '11px', color: '#999999' }}>
                      Duree: {transaction.duration}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '11px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', marginBottom: '8px' }}>
                      MATERIELS:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {transaction.materials.map((material, idx) => (
                        <div key={idx} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{material.materialName}</span>
                          <span style={{ color: material.taken ? '#22AA22' : '#CC0000' }}>
                            {material.taken ? 'OUI' : 'NON'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleScroll('right')}
              style={{ padding: '8px', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
            >
              <ChevronRightIcon size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MaterialListAdminScreen = () => {
  const { materials, removeMaterial, updateMaterial, setCurrentScreen } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      updateMaterial(id, { name: editName });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce materiel ?')) {
      removeMaterial(id);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: THEME.black, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <button
        onClick={() => setCurrentScreen('settings')}
        style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 40, padding: '8px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
      >
        <ArrowLeft size={50} strokeWidth={4} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '48px 16px', overflowY: 'auto' }}>
        <h1 style={{ background: 'linear-gradient(to right, #DC2626, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '32px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', fontWeight: 900, marginBottom: '16px' }}>
          LISTE DU MATERIEL (ADMINISTRATION)
        </h1>

        {materials.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999999', paddingTop: '48px' }}>
            <p style={{ fontSize: '18px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic' }}>Aucun materiel enregistre</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', width: '100%', maxWidth: '1000px' }}>
            {materials.map((material) => (
              <div key={material.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', border: '2px solid #666666', backgroundColor: '#1a1a1a' }}>
                <div style={{ width: '128px', height: '128px', backgroundColor: '#333333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {material.image ? (
                    <img src={material.image} alt={material.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#999999', fontSize: '12px', textAlign: 'center' }}>Image</div>
                  )}
                </div>

                {editingId === material.id ? (
                  <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#333333', border: '2px solid white', borderRadius: '4px', color: 'white', fontSize: '12px' }}
                    />
                    <button
                      onClick={() => handleSaveEdit(material.id)}
                      style={{ padding: '8px 12px', backgroundColor: '#22AA22', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', textAlign: 'center' }}>
                    {material.name}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleEdit(material.id, material.name)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Edit size={14} />
                    MODIFIER
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif", fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Trash2 size={14} />
                    SUPPRIMER
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

const App = () => {
  const { currentScreen } = useAppContext();

  switch (currentScreen) {
    case 'home':
      return <HomeScreen />;
    case 'room':
      return <RoomScreen />;
    case 'identification':
      return <IdentificationScreen />;
    case 'selection':
      return <SelectionScreen />;
    case 'signature1':
      return <Signature1Screen />;
    case 'finalSignature':
      return <FinalSignatureScreen />;
    case 'materialList':
      return <MaterialListScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'addMaterial':
      return <AddMaterialScreen />;
    case 'identityDatabase':
      return <IdentityDatabaseScreen />;
    case 'history':
      return <HistoryScreen />;
    case 'materialListAdmin':
      return <MaterialListAdminScreen />;
    default:
      return <HomeScreen />;
  }
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

export default App;
