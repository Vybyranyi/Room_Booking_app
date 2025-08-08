import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Room {
  id: number;
  title: string;
  description: string;
}

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  isLoading: false,
  error: null,
};

const getAuthToken = (getState: any): string => {
  return (getState() as any).auth.token;
};

// Async Thunk для отримання кімнат
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch('http://localhost:3000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk для створення кімнати
export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData: { title: string, description: string }, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// НОВИЙ Async Thunk для редагування кімнати
export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async (roomData: { id: number, title: string, description: string }, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch(`http://localhost:3000/api/rooms/${roomData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// НОВИЙ Async Thunk для видалення кімнати
export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (roomId: number, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return roomId; // Повертаємо ID видаленої кімнати
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ... (обробники для fetchRooms і createRoom без змін)
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        state.isLoading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Обробники для оновлення кімнати
      .addCase(updateRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        const updatedRoom = action.payload;
        const index = state.rooms.findIndex(room => room.id === updatedRoom.id);
        if (index !== -1) {
          state.rooms[index] = updatedRoom;
        }
      })
      // Обробники для видалення кімнати
      .addCase(deleteRoom.fulfilled, (state, action: PayloadAction<number>) => {
        const deletedRoomId = action.payload;
        state.rooms = state.rooms.filter(room => room.id !== deletedRoomId);
      });
  },
});

export default roomSlice.reducer;