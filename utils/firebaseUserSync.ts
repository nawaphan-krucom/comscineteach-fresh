/**
 * Option 2: Firebase Direct User Sync Utility
 * 
 * This utility provides realtime user data fetching directly from Firebase collections.
 * Use this when you need live data instead of local JSON snapshots.
 * 
 * Usage:
 *   const users = await fetchUsersFromFirebase();
 *   const usersIndex = await fetchUsersIndexFromFirebase();
 */

import { db } from '../firebase';
import type { User } from '../types';

/**
 * Fetch users from Firebase 'users' collection
 * Returns array of User objects with basic data
 */
export async function fetchUsersFromFirebase(): Promise<User[]> {
  try {
    if (!db) {
      console.warn('Firebase not initialized, returning empty array');
      return [];
    }

    const snapshot = await db.collection('users').get();
    const users: User[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() || {};
      users.push({
        id: String(data.id || doc.id),
        username: String(data.username || data.id || ''),
        name: data.name || 'นักเรียน',
        role: data.role || 'student',
        avatar: data.avatar || '🧑‍🎓',
        classLevel: data.classLevel || 'ม.4',
        room: data.room || ''
      });
    });

    console.log(`✅ Fetched ${users.length} users from Firebase 'users' collection`);
    return users;
  } catch (error) {
    console.error('❌ Error fetching users from Firebase:', error);
    throw error;
  }
}

/**
 * Fetch users from Firebase 'users_index' collection (RICHER DATA)
 * Includes: uid, studentId, room, seatNumber, migratedToAuth, passwordResetRequired
 * Returns array of User objects with complete metadata
 */
export async function fetchUsersIndexFromFirebase(): Promise<User[]> {
  try {
    if (!db) {
      console.warn('Firebase not initialized, returning empty array');
      return [];
    }

    const snapshot = await db.collection('users_index').get();
    const users: User[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() || {};
      users.push({
        id: String(data.uid || data.studentId || doc.id),
        username: String(data.studentId || doc.id || ''),
        name: data.displayName || data.name || 'นักเรียน',
        role: data.role || 'student',
        avatar: data.avatar || '🧑‍🎓',
        classLevel: data.classLevel || 'ม.4',
        room: data.room || '',
        seatNumber: data.seatNumber,
        sessionToken: data.uid // Store Firebase Auth uid as session token
      });
    });

    console.log(`✅ Fetched ${users.length} users from Firebase 'users_index' collection (richer data)`);
    return users;
  } catch (error) {
    console.error('❌ Error fetching users from Firebase users_index:', error);
    throw error;
  }
}

/**
 * Get a single user by ID from Firebase
 */
export async function fetchUserByIdFromFirebase(userId: string): Promise<User | null> {
  try {
    if (!db) {
      console.warn('Firebase not initialized');
      return null;
    }
    // Prefer the authoritative `users` collection first, then fall back to `users_index` if needed
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data() || {};
      return {
        id: String(data.id || userId),
        username: String(data.username || userId),
        name: data.name || 'นักเรียน',
        role: data.role || 'student',
        avatar: data.avatar || '🧑‍🎓',
        classLevel: data.classLevel || 'ม.4',
        room: data.room || ''
      };
    }

    // Fallback: try users_index (richer/legacy dataset)
    const indexDoc = await db.collection('users_index').doc(userId).get();
    if (indexDoc.exists) {
      const data = indexDoc.data() || {};
      return {
        id: String(data.uid || data.studentId || userId),
        username: String(data.studentId || userId),
        name: data.displayName || data.name || 'นักเรียน',
        role: data.role || 'student',
        avatar: data.avatar || '🧑‍🎓',
        classLevel: data.classLevel || 'ม.4',
        room: data.room || '',
        seatNumber: data.seatNumber,
        sessionToken: data.uid
      };
    }
    if (userDoc.exists) {
      const data = userDoc.data() || {};
      return {
        id: String(data.id || userId),
        username: String(data.username || userId),
        name: data.name || 'นักเรียน',
        role: data.role || 'student',
        avatar: data.avatar || '🧑‍🎓',
        classLevel: data.classLevel || 'ม.4',
        room: data.room || ''
      };
    }

    console.warn(`⚠️ User ${userId} not found in Firebase`);
    return null;
  } catch (error) {
    console.error('❌ Error fetching user from Firebase:', error);
    throw error;
  }
}

/**
 * Get users grouped by room
 */
export async function fetchUsersByRoomFromFirebase(): Promise<Record<string, User[]>> {
  try {
    // Prefer live `users` collection; fall back to `users_index` for richer legacy data
    let users = await fetchUsersFromFirebase();
    if (!users || users.length === 0) {
      users = await fetchUsersIndexFromFirebase();
    }
    const grouped: Record<string, User[]> = {};

    users.forEach(user => {
      const room = user.room || '(ไม่มีห้อง)';
      if (!grouped[room]) {
        grouped[room] = [];
      }
      grouped[room].push(user);
    });

    // Sort rooms numerically with unassigned at top
    const sorted: Record<string, User[]> = {};
    if (grouped['(ไม่มีห้อง)']) {
      sorted['(ไม่มีห้อง)'] = grouped['(ไม่มีห้อง)'];
    }

    Object.keys(grouped)
      .filter(k => k !== '(ไม่มีห้อง)')
      .sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
      })
      .forEach(room => {
        sorted[room] = grouped[room];
      });

    console.log(`✅ Grouped ${users.length} users by room`);
    return sorted;
  } catch (error) {
    console.error('❌ Error fetching users by room:', error);
    throw error;
  }
}

/**
 * Sync users_index data from Firebase to local JSON file
 * (Useful for testing/debugging without Firebase dependency)
 */
export async function syncUsersIndexToJson(filepath: string): Promise<void> {
  try {
    const users = await fetchUsersIndexFromFirebase();
    const fs = await import('fs/promises');
    await fs.writeFile(filepath, JSON.stringify(users, null, 2));
    console.log(`✅ Synced ${users.length} users to ${filepath}`);
  } catch (error) {
    console.error('❌ Error syncing users to JSON:', error);
    throw error;
  }
}
