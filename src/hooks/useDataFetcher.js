import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';

export function useDataFetcher() {
  const { userId } = useAuthStore();
  const { fetchData, unsubscribeAll } = useDataStore();

  useEffect(() => {
    if (userId) {
      fetchData(userId);
    }

    return () => {
      unsubscribeAll();
    };
  }, [userId, fetchData, unsubscribeAll]);
}