// app/context/AppContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAllRooms, freeRoom, occupyRoom } from '../database/roomQueries';
import { getAllMaterials } from '../database/materialQueries';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Transaction en cours
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [transactionMode, setTransactionMode] = useState('take'); // 'take' | 'add'

  const refreshRooms = useCallback(async () => {
    const data = await getAllRooms();
    setRooms(data);
  }, []);

  const refreshMaterials = useCallback(async () => {
    const data = await getAllMaterials();
    setMaterials(data);
  }, []);

  const startTransaction = (room, user) => {
    setCurrentRoom(room);
    setCurrentUser(user);
    setSelectedMaterials([]);
    setTransactionMode('take');
  };

  const clearTransaction = () => {
    setCurrentRoom(null);
    setCurrentUser(null);
    setCurrentTransaction(null);
    setSelectedMaterials([]);
    setTransactionMode('take');
  };

  return (
    <AppContext.Provider value={{
      rooms, setRooms, refreshRooms,
      materials, setMaterials, refreshMaterials,
      backgroundImage, setBackgroundImage,
      currentRoom, setCurrentRoom,
      currentUser, setCurrentUser,
      currentTransaction, setCurrentTransaction,
      selectedMaterials, setSelectedMaterials,
      transactionMode, setTransactionMode,
      startTransaction, clearTransaction,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
