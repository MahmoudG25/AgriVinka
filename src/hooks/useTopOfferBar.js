import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTopOfferBar = () => {
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const offerDocRef = doc(db, 'site_ui', 'top_offer_bar');

    const unsubscribe = onSnapshot(
      offerDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setOfferData(docSnapshot.data());
        } else {
          setOfferData(null);
        }
        setLoading(false);
      },
      (err) => {
        // If permission is denied (e.g., user is not authorized or logged out), simply hide the bar.
        if (err.code !== 'permission-denied') {
          console.error('Error fetching Top Offer Bar data:', err);
        }
        setError(err);
        setLoading(false);
        setOfferData(null);
      }
    );

    return () => unsubscribe();
  }, []);

  return { offerData, loading, error };
};
