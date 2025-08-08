import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  roomId: number;
  creatorId: number;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  isLoading: false,
  error: null,
};

const getAuthToken = (getState: any): string => {
  return (getState() as RootState).auth.token as string;
};

// Thunk для отримання всіх бронювань
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch('http://localhost:3000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` },
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

// Thunk для створення бронювання
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData: { roomId: number, startTime: string, endTime: string }, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
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

// Thunk для оновлення бронювання
export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async (bookingData: { id: number, roomId: number, startTime: string, endTime: string }, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
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

// Thunk для видалення бронювання
export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (bookingId: number, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ... (обробники для інших Thunk)
      .addCase(fetchBookings.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => { state.isLoading = false; state.bookings = action.payload; })
      .addCase(fetchBookings.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => { state.bookings.push(action.payload); })
      .addCase(updateBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<number>) => {
        state.bookings = state.bookings.filter(b => b.id !== action.payload);
      });
  },
});

export default bookingSlice.reducer;