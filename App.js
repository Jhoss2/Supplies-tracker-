import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, 
  Alert, Image, Modal, Dimensions, Share 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SQLite from 'react-native-sqlite-storage';
import { launchCamera } from 'react-native-image-picker';
import SignatureScreen from 'react-native-signature-canvas';
import { ChevronRight, ArrowLeft, X, Camera, Trash2, Edit, Image as ImageIcon, Download, ChevronLeft, Upload } from 'lucide-react-native';

SQLite.enablePromise(false);

// ============================================================================
// CONFIGURATION & THEME
// ============================================================================
const THEME = {
  black: '#000000', white: '#FFFFFF', grayButton: '#E0E0E0',
  blueStart: '#1E3A8A', redStart: '#B91C1C', redLight: '#DC2626',
};

const GRAYED_ROOMS = ['TOGUYENI', 'SALLE 15', 'SALLE 07', 'SALLE 16', 'SALLE 22', 'SALLE 23', 'SALLE 04', 'SALLE 19', 'SALLE 18', 'SALLE 27', 'LAB B ROOM 3', 'AMPHI R.2.A', 'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.2.C', 'AMPHI R.2.D'];
const ROOMS_TOP = ['TOUR DU SAVOIR', 'TOGUYENI', 'SALLE 15', 'SALLE 05'];
const ROOMS_MIDDLE = ['SALLE 04', 'SALLE 06', 'SALLE 07', 'SALLE 16', 'SALLE 17', 'SALLE 18', 'SALLE 19', 'SALLE 21', 'SALLE 22', 'SALLE 23', 'SALLE 26', 'SALLE 27', 'LAB B ROOM 3', 'LAB ROOM 1', 'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.1', 'AMPHI R.2.A'];
const ROOMS_BOT = ['AMPHI R.2.B', 'AMPHI R.2.C', 'AMPHI R.2.D', 'AMPHI R.4'];
const ITEMS_REQUIRING_QUANTITY = ['RALLONGE', 'CÂBLE HDMI', 'CÂBLE VGA', 'MICRO FILAIRE'];

// ============================================================================
// SQLITE STORAGE (Native)
// ============================================================================
const db = SQLite.openDatabase({ name: 'SuppliesTracker.db', location: 'default' }, () => {}, error => console.log(error));

const initDB = () => {
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS materials (id TEXT PRIMARY KEY, name TEXT, image TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, roomName TEXT, studentName TEXT, studentSurname TEXT, filiere TEXT, duration TEXT, timestamp TEXT, materials TEXT, signature1 TEXT, signatureFinal TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS identities (id TEXT PRIMARY KEY, name TEXT, surname TEXT, filiere TEXT, photo TEXT, date TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS occupiedRooms (roomName TEXT PRIMARY KEY)');
  });
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
    initDB();
    loadData();
  }, []);

  const loadData = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM materials', [], (_, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) temp.push(results.rows.item(i));
        setMaterials(temp);
      });
      tx.executeSql('SELECT * FROM transactions', [], (_, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          let item = results.rows.item(i);
          item.materials = JSON.parse(item.materials);
          temp.push(item);
        }
        setTransactions(temp);
      });
      tx.executeSql('SELECT * FROM identities', [], (_, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) temp.push(results.rows.item(i));
        setIdentities(temp);
      });
      tx.executeSql('SELECT * FROM occupiedRooms', [], (_, results) => {
        let temp = new Set();
        for (let i = 0; i < results.rows.length; ++i) temp.add(results.rows.item(i).roomName);
        setOccupiedRoomsState(temp);
      });
    });
  };

  const addMaterial = (material) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO materials (id, name, image) VALUES (?,?,?)', [material.id, material.name, material.image], () => loadData());
    });
  };

  const removeMaterial = (id) => {
    db.transaction(tx => { tx.executeSql('DELETE FROM materials WHERE id = ?', [id], () => loadData()); });
  };

  const updateMaterial = (id, updates) => {
    db.transaction(tx => { tx.executeSql('UPDATE materials SET name = ? WHERE id = ?', [updates.name, id], () => loadData()); });
  };

  const toggleItemSelection = (materialId, quantity = 1) => {
    const existing = currentSelectedItems.find(item => item.materialId === materialId);
    if (existing) setCurrentSelectedItems(currentSelectedItems.filter(item => item.materialId !== materialId));
    else setCurrentSelectedItems([...currentSelectedItems, { materialId, quantity }]);
  };

  const addTransaction = (t) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO transactions (id, roomName, studentName, studentSurname, filiere, duration, timestamp, materials, signature1, signatureFinal) VALUES (?,?,?,?,?,?,?,?,?,?)', 
      [t.id, t.roomName, t.studentName, t.studentSurname, t.filiere, t.duration, t.timestamp, JSON.stringify(t.materials), t.signature1, t.signatureFinal], () => loadData());
    });
  };

  const addIdentity = (identity) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO identities (id, name, surname, filiere, photo, date) VALUES (?,?,?,?,?,?)', 
      [identity.id, identity.name, identity.surname, identity.filiere, identity.photo, identity.date], () => loadData());
    });
  };

  const removeIdentity = (id) => {
    db.transaction(tx => { tx.executeSql('DELETE FROM identities WHERE id = ?', [id], () => loadData()); });
  };

  const setRoomOccupied = (roomName, occupied) => {
    db.transaction(tx => {
      if (occupied) tx.executeSql('INSERT OR IGNORE INTO occupiedRooms (roomName) VALUES (?)', [roomName], () => loadData());
      else tx.executeSql('DELETE FROM occupiedRooms WHERE roomName = ?', [roomName], () => loadData());
    });
  };

  const resetCurrentSession = () => {
    setStudentInfo({ name: '', surname: '', filiere: '', cardPhoto: null });
    setCurrentSelectedItems([]); setDuration(''); setSignature1(null); setSignatureFinal(null);
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
// COMPONENTS
// ============================================================================
const RoomButton = ({ text, onClick, occupied = false }) => {
  const isGrayed = GRAYED_ROOMS.includes(text);
  return (
    <TouchableOpacity onPress={onClick} style={[styles.roomBtn, { backgroundColor: isGrayed ? (occupied ? '#DC2626' : '#E0E0E0') : 'white', borderColor: isGrayed ? '#999' : 'white' }]}>
      <Text style={[styles.roomBtnText, { color: isGrayed ? (occupied ? 'white' : '#000') : 'black' }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const ActionButton = ({ text, onClick, isRed = true }) => (
  <TouchableOpacity onPress={onClick}>
    <LinearGradient colors={isRed ? ['#B91C1C', '#000000'] : ['#1E3A8A', '#000000']} style={styles.actionBtn}>
      <Text style={styles.actionBtnText}>{text}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const StandardButton = ({ text, onClick }) => (
  <TouchableOpacity onPress={onClick}>
    <LinearGradient colors={['#1E3A8A', '#000000']} style={styles.standardBtn}>
      <Text style={styles.standardBtnText}>{text}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// ============================================================================
// SCREENS
// ============================================================================
const HomeScreen = () => {
  const { setCurrentScreen, occupiedRooms, setCurrentRoom } = useAppContext();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');

  const handlePasswordSubmit = () => {
    if (password === 'U-AUBEN SUPPLIES TRACKER') {
      setShowPasswordDialog(false); setPassword(''); setCurrentScreen('settings');
    } else {
      Alert.alert('Erreur', 'Mot de passe incorrect'); setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowPasswordDialog(true)} style={styles.backBtn}>
        <ChevronRight color="#999" size={40} />
      </TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>PANNEAU D'ADMINISTRATION</Text>
        <View style={styles.roomGridRow}>
          {ROOMS_TOP.map((r) => <RoomButton key={r} text={r} onClick={() => {setCurrentRoom(r); setCurrentScreen('room');}} occupied={occupiedRooms.has(r)} />)}
        </View>
        {[0, 1, 2].map((rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.roomGridRow6}>
            {ROOMS_MIDDLE.slice(rowIdx * 6, (rowIdx + 1) * 6).map((r) => (
              <RoomButton key={r} text={r} onClick={() => {setCurrentRoom(r); setCurrentScreen('room');}} occupied={occupiedRooms.has(r)} />
            ))}
          </View>
        ))}
        <View style={styles.roomGridRow}>
          {ROOMS_BOT.map((r) => <RoomButton key={r} text={r} onClick={() => {setCurrentRoom(r); setCurrentScreen('room');}} occupied={occupiedRooms.has(r)} />)}
        </View>
      </View>

      <Modal visible={showPasswordDialog} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PARAMÈTRES</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Mot de passe" placeholderTextColor="#999" />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowPasswordDialog(false)} style={styles.modalBtnCancel}><Text style={styles.btnTextWhite}>ANNULER</Text></TouchableOpacity>
              <TouchableOpacity onPress={handlePasswordSubmit} style={styles.modalBtnOk}><Text style={styles.btnTextWhite}>VALIDER</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const RoomScreen = () => {
  const { currentRoom, setCurrentScreen, setCurrentRoom, occupiedRooms } = useAppContext();
  const isOccupied = currentRoom && occupiedRooms.has(currentRoom);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { setCurrentRoom(null); setCurrentScreen('home'); }} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>{currentRoom}</Text>
        {isOccupied && <View style={styles.occupiedBadge}><Text style={styles.occupiedText}>SALLE OCCUPÉE</Text></View>}
        <View style={styles.actionGrid}>
          <ActionButton text="PRENDRE MATÉRIEL" onClick={() => setCurrentScreen('identification')} />
          <ActionButton text="AJOUTER MATÉRIEL" onClick={() => setCurrentScreen('selection')} />
          <ActionButton text="LISTE MATÉRIEL" onClick={() => setCurrentScreen('materialList')} />
          <ActionButton text="SIGNATURE FINALE" onClick={() => setCurrentScreen('finalSignature')} />
        </View>
      </View>
    </View>
  );
};

const IdentificationScreen = () => {
  const { setCurrentScreen, studentInfo, setStudentInfo } = useAppContext();
  const [filiere, setFiliere] = useState('');
  const [photo, setPhoto] = useState(null);

  const takePhoto = async () => {
    if (!filiere.trim()) { Alert.alert('Erreur', 'Veuillez remplir la filière'); return; }
    const result = await launchCamera({ mediaType: 'photo', includeBase64: true });
    if (result.assets && result.assets.length > 0) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Image);
      setStudentInfo({ ...studentInfo, filiere, cardPhoto: base64Image });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('room')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>IDENTIFICATION</Text>
        <View style={styles.cameraBox}>
          {photo ? <Image source={{ uri: photo }} style={styles.fullImage} /> : <Camera color="#FFF" size={60} />}
        </View>
        {!photo && <TextInput style={[styles.input, { width: 300, marginVertical: 20 }]} value={filiere} onChangeText={setFiliere} placeholder="FILIÈRE" placeholderTextColor="#999" />}
        <View style={styles.rowBtns}>
          {!photo ? (
            <TouchableOpacity onPress={takePhoto} style={styles.redButton}><Camera color="#FFF" size={20} /><Text style={styles.btnTextWhite}> PRENDRE PHOTO</Text></TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.blueButton}><Text style={styles.btnTextWhite}>RECOMMENCER</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentScreen('selection')} style={styles.redButton}><Text style={styles.btnTextWhite}>CONTINUER</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const SelectionScreen = () => {
  const { materials, currentSelectedItems, toggleItemSelection, setCurrentScreen, setDuration } = useAppContext();
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);
  const [qty, setQty] = useState('1');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('room')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.topContent}>
        <Text style={styles.mainTitle}>SÉLECTION MATÉRIEL</Text>
        <ScrollView contentContainerStyle={styles.matGrid}>
          {materials.map(m => {
            const isSelected = currentSelectedItems.some(i => i.materialId === m.id);
            return (
              <TouchableOpacity key={m.id} style={[styles.matCard, isSelected && styles.matCardSelected]} onPress={() => {
                if (ITEMS_REQUIRING_QUANTITY.some(item => m.name.includes(item))) { setSelectedMat(m.id); setShowQtyModal(true); setQty('1'); }
                else { toggleItemSelection(m.id); }
              }}>
                <View style={styles.matThumb}>{m.image ? <Image source={{ uri: m.image }} style={styles.fullImage} /> : <Text style={styles.thumbText}>IMG</Text>}</View>
                <Text style={styles.matText}>{m.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <StandardButton text="VALIDER" onClick={() => {
          if(currentSelectedItems.length === 0) Alert.alert("Erreur", "Sélectionnez au moins un matériel");
          else { setDuration("08:00 - 10:00"); setCurrentScreen('signature1'); } // Simplified for mobile UI demo
        }} />
      </View>
      <Modal visible={showQtyModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QUANTITÉ</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={qty} onChangeText={setQty} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowQtyModal(false)} style={styles.modalBtnCancel}><Text style={styles.btnTextWhite}>ANNULER</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { toggleItemSelection(selectedMat, parseInt(qty)); setShowQtyModal(false); }} style={styles.modalBtnOk}><Text style={styles.btnTextWhite}>OK</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Signature1Screen = () => {
  const { setCurrentScreen, setSignature1 } = useAppContext();
  const ref = useRef();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('selection')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>PREMIÈRE SIGNATURE</Text>
        <View style={styles.sigContainer}>
          <SignatureScreen ref={ref} onOK={(sig) => { setSignature1(sig); setCurrentScreen('home'); }} onEmpty={() => Alert.alert("Erreur", "Veuillez signer")} descriptionText="Signez ici" clearText="Effacer" confirmText="Valider" webStyle={`.m-signature-pad { background-color: #333; border: 2px solid #fff; }`} />
        </View>
        <View style={styles.rowBtns}>
          <TouchableOpacity onPress={() => ref.current.clearSignature()} style={styles.blueButton}><Text style={styles.btnTextWhite}>EFFACER</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => ref.current.readSignature()} style={styles.redButton}><Text style={styles.btnTextWhite}>VALIDER</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const FinalSignatureScreen = () => {
  const { setCurrentScreen, signature1, studentInfo, currentSelectedItems, materials, currentRoom, duration, addTransaction, addIdentity, setRoomOccupied, resetCurrentSession } = useAppContext();
  const ref = useRef();

  const handleSave = (sig) => {
    const transaction = {
      id: Date.now().toString(),
      roomName: currentRoom || 'UNKNOWN',
      studentName: studentInfo.name, studentSurname: studentInfo.surname, filiere: studentInfo.filiere,
      duration: duration, timestamp: new Date().toLocaleString('fr-FR'),
      materials: currentSelectedItems.map(item => ({ materialId: item.materialId, materialName: materials.find(m => m.id === item.materialId)?.name, quantity: item.quantity, taken: true })),
      signature1: signature1, signatureFinal: sig,
    };
    addTransaction(transaction);
    if (studentInfo.cardPhoto) addIdentity({ id: Date.now().toString(), name: studentInfo.name, surname: studentInfo.surname, filiere: studentInfo.filiere, photo: studentInfo.cardPhoto, date: new Date().toLocaleDateString('fr-FR') });
    if (currentRoom) setRoomOccupied(currentRoom, true);
    resetCurrentSession();
    setCurrentScreen('home');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('room')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>SIGNATURE FINALE</Text>
        <View style={styles.sigContainer}>
          <SignatureScreen ref={ref} onOK={handleSave} onEmpty={() => Alert.alert("Erreur", "Veuillez signer")} descriptionText="Signez ici" clearText="Effacer" confirmText="Valider" />
        </View>
        <View style={styles.rowBtns}>
          <TouchableOpacity onPress={() => ref.current.clearSignature()} style={styles.blueButton}><Text style={styles.btnTextWhite}>EFFACER</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => ref.current.readSignature()} style={styles.redButton}><Text style={styles.btnTextWhite}>VALIDER</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MaterialListScreen = () => {
  const { materials, removeMaterial, setCurrentScreen } = useAppContext();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('room')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.topContent}>
        <Text style={styles.mainTitle}>LISTE MATÉRIEL</Text>
        <ScrollView style={{width: '100%'}}>
          {materials.map(m => (
            <View key={m.id} style={styles.listRow}>
              <View style={styles.listRowThumb}>{m.image ? <Image source={{ uri: m.image }} style={styles.fullImage}/> : <Text style={styles.thumbText}>IMG</Text>}</View>
              <Text style={styles.listRowText}>{m.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const MaterialListAdminScreen = () => {
  const { materials, removeMaterial, setCurrentScreen } = useAppContext();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.topContent}>
        <Text style={styles.mainTitle}>ADMIN MATÉRIEL</Text>
        <ScrollView style={{width: '100%'}}>
          {materials.map(m => (
            <View key={m.id} style={styles.listRow}>
              <View style={styles.listRowThumb}>{m.image && <Image source={{ uri: m.image }} style={styles.fullImage}/>}</View>
              <Text style={styles.listRowText}>{m.name}</Text>
              <TouchableOpacity onPress={() => Alert.alert("Supprimer", "Sûr ?", [{text:"Non"},{text:"Oui", onPress:()=>removeMaterial(m.id)}])}><Trash2 color="#DC2626" size={24} /></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const AddMaterialScreen = () => {
  const { addMaterial, setCurrentScreen } = useAppContext();
  const [name, setName] = useState('');
  const [img, setImg] = useState(null);

  const pickImage = async () => {
    const result = await launchCamera({ mediaType: 'photo', includeBase64: true });
    if (result.assets) setImg(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const handleSave = () => {
    if(!name.trim() || !img) { Alert.alert("Erreur", "Nom et image requis"); return; }
    addMaterial({ id: Date.now().toString(), name: name.toUpperCase(), image: img });
    Alert.alert("Succès", "Matériel ajouté");
    setCurrentScreen('settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>AJOUTER MATÉRIEL</Text>
        <TouchableOpacity onPress={pickImage} style={styles.cameraBox}>
          {img ? <Image source={{ uri: img }} style={styles.fullImage} /> : <ImageIcon color="#FFF" size={40} />}
        </TouchableOpacity>
        <TextInput style={[styles.input, { width: 300, marginVertical: 20 }]} value={name} onChangeText={setName} placeholder="NOM DU MATÉRIEL" placeholderTextColor="#999" />
        <TouchableOpacity onPress={handleSave} style={[styles.redButton, {width: 300}]}><Text style={styles.btnTextWhite}>AJOUTER</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const IdentityDatabaseScreen = () => {
  const { identities, removeIdentity, setCurrentScreen } = useAppContext();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.topContent}>
        <Text style={styles.mainTitle}>BASE IDENTITÉS</Text>
        <ScrollView contentContainerStyle={styles.matGrid}>
          {identities.map(i => (
            <View key={i.id} style={styles.idCard}>
              <Image source={{uri: i.photo}} style={styles.idPhoto} />
              <Text style={styles.idText}>{i.filiere}</Text>
              <TouchableOpacity onPress={() => Alert.alert("Supprimer", "Sûr ?", [{text:"Non"},{text:"Oui", onPress:()=>removeIdentity(i.id)}])} style={styles.idDelBtn}><Trash2 color="#FFF" size={16} /></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const HistoryScreen = () => {
  const { transactions, setCurrentScreen } = useAppContext();
  const handleExport = () => {
    let csv = 'Salle,Filiere,Nom Etudiant,Duree Cours,Materiel,Pris\n';
    transactions.forEach(t => {
      const m = t.materials.map(mat => `${mat.materialName}(${mat.taken?'OUI':'NON'})`).join('; ');
      csv += `${t.roomName},${t.filiere},${t.studentName},${t.duration},"${m}"\n`;
    });
    Share.share({ message: csv, title: 'Export Historique' });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <TouchableOpacity onPress={handleExport} style={styles.exportBtn}><Download color="#DC2626" size={24} /></TouchableOpacity>
      <View style={styles.topContent}>
        <Text style={styles.mainTitle}>HISTORIQUE</Text>
        <ScrollView style={{width: '100%'}}>
          {transactions.map(t => (
            <View key={t.id} style={styles.historyCard}>
              <Text style={styles.histTextRed}>{t.roomName} - {t.timestamp}</Text>
              <Text style={styles.histText}>{t.filiere}</Text>
              <Text style={styles.histTextGray}>Durée: {t.duration}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const SettingsScreen = () => {
  const { setCurrentScreen } = useAppContext();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backBtn}><ArrowLeft color="#999" size={40} /></TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.mainTitle}>PARAMÈTRES</Text>
        <View style={styles.actionGrid}>
          <ActionButton text="AJOUTER MATÉRIEL" onClick={() => setCurrentScreen('addMaterial')} />
          <ActionButton text="LISTE MATÉRIEL" onClick={() => setCurrentScreen('materialListAdmin')} />
          <ActionButton text="BASE IDENTITÉS" onClick={() => setCurrentScreen('identityDatabase')} />
          <ActionButton text="HISTORIQUE" onClick={() => setCurrentScreen('history')} />
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN APP ROUTER
// ============================================================================
const AppContent = () => {
  const { currentScreen } = useAppContext();
  switch (currentScreen) {
    case 'home': return <HomeScreen />;
    case 'room': return <RoomScreen />;
    case 'identification': return <IdentificationScreen />;
    case 'selection': return <SelectionScreen />;
    case 'signature1': return <Signature1Screen />;
    case 'finalSignature': return <FinalSignatureScreen />;
    case 'materialList': return <MaterialListScreen />;
    case 'settings': return <SettingsScreen />;
    case 'addMaterial': return <AddMaterialScreen />;
    case 'identityDatabase': return <IdentityDatabaseScreen />;
    case 'history': return <HistoryScreen />;
    case 'materialListAdmin': return <MaterialListAdminScreen />;
    default: return <HomeScreen />;
  }
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  topContent: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  backBtn: { position: 'absolute', top: 30, left: 20, zIndex: 50 },
  exportBtn: { position: 'absolute', top: 30, right: 20, zIndex: 50 },
  mainTitle: { color: '#DC2626', fontSize: 30, fontWeight: '900', fontStyle: 'italic', marginBottom: 30, textAlign: 'center' },
  roomGridRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 },
  roomGridRow6: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10, maxWidth: 600 },
  roomBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, margin: 4, borderWidth: 1 },
  roomBtnText: { fontSize: 10, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 },
  actionBtn: { width: 140, height: 140, margin: 10, borderRadius: 25, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 10 },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900', fontStyle: 'italic', textAlign: 'center' },
  standardBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#FFF' },
  standardBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900', fontStyle: 'italic' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1a1a1a', padding: 30, borderRadius: 8, borderWidth: 2, borderColor: '#FFF', width: 300 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#333', color: '#FFF', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#666', fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtnCancel: { flex: 1, backgroundColor: '#555', padding: 12, borderRadius: 4, alignItems: 'center', marginRight: 5 },
  modalBtnOk: { flex: 1, backgroundColor: '#B91C1C', padding: 12, borderRadius: 4, alignItems: 'center', marginLeft: 5 },
  btnTextWhite: { color: '#FFF', fontWeight: 'bold', fontStyle: 'italic' },
  occupiedBadge: { backgroundColor: '#7a0000', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#DC2626', marginBottom: 20 },
  occupiedText: { color: '#FF9999', fontWeight: 'bold', fontSize: 16 },
  cameraBox: { width: 300, height: 200, backgroundColor: '#1a1a1a', borderWidth: 4, borderColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  rowBtns: { flexDirection: 'row', gap: 16, marginTop: 20 },
  redButton: { backgroundColor: '#B91C1C', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  blueButton: { backgroundColor: '#1E3A8A', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  matGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  matCard: { width: 100, alignItems: 'center', padding: 10, backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#666', borderRadius: 8 },
  matCardSelected: { borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,0.2)' },
  matThumb: { width: 60, height: 60, backgroundColor: '#333', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  thumbText: { color: '#999', fontSize: 10 },
  matText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  sigContainer: { width: 350, height: 200, borderColor: '#FFF', borderWidth: 4, borderRadius: 8, backgroundColor: '#333' },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#444' },
  listRowThumb: { width: 50, height: 50, backgroundColor: '#333', borderRadius: 4, marginRight: 15, overflow: 'hidden' },
  listRowText: { color: '#FFF', flex: 1, fontWeight: 'bold' },
  historyCard: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#666', marginBottom: 10 },
  histTextRed: { color: '#DC2626', fontWeight: 'bold', marginBottom: 5 },
  histText: { color: '#FFF', marginBottom: 5 },
  histTextGray: { color: '#999', fontSize: 12 },
  idCard: { width: 120, alignItems: 'center', backgroundColor: '#1a1a1a', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#666', margin: 5 },
  idPhoto: { width: 100, height: 120, borderRadius: 4, marginBottom: 10 },
  idText: { color: '#FFF', fontSize: 10, marginBottom: 10 },
  idDelBtn: { backgroundColor: '#CC0000', padding: 8, borderRadius: 4, width: '100%', alignItems: 'center' }
});

export default App;
