import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import type { ShoppingItem, TomorrowSuggestion } from '../types'

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function initFirebase(): boolean {
  const configStr = import.meta.env.VITE_FIREBASE_CONFIG
  if (!configStr) {
    console.warn('Firebase config not found. Sharing features disabled.')
    return false
  }

  let firebaseConfig
  try {
    firebaseConfig = JSON.parse(configStr)
  } catch (error) {
    console.error('Invalid Firebase config JSON:', error)
    return false
  }

  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    return true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return false
  }
}

export function isFirebaseEnabled(): boolean {
  return db !== null
}

// Generate a random 6-character invite code
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Household data structure in Firestore
interface HouseholdDoc {
  id: string
  name: string
  inviteCode: string
  createdAt: number
  shoppingList: ShoppingItem[]
  tomorrowSuggestions: TomorrowSuggestion[]
}

// Create a new household
export async function createHousehold(name: string): Promise<{ id: string; inviteCode: string } | null> {
  if (!db) return null

  const id = crypto.randomUUID()
  const inviteCode = generateInviteCode()

  const householdDoc: HouseholdDoc = {
    id,
    name,
    inviteCode,
    createdAt: Date.now(),
    shoppingList: [],
    tomorrowSuggestions: [],
  }

  try {
    await setDoc(doc(db, 'households', id), householdDoc)
    return { id, inviteCode }
  } catch (error) {
    console.error('Failed to create household:', error)
    return null
  }
}

// Join a household by invite code
export async function joinHousehold(inviteCode: string): Promise<string | null> {
  if (!db) return null

  try {
    const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode.toUpperCase()))
    const snapshot = await import('firebase/firestore').then(m => m.getDocs(q))

    if (snapshot.empty) {
      return null
    }

    return snapshot.docs[0].id
  } catch (error) {
    console.error('Failed to join household:', error)
    return null
  }
}

// Get household data
export async function getHousehold(householdId: string): Promise<HouseholdDoc | null> {
  if (!db) return null

  try {
    const docRef = doc(db, 'households', householdId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return docSnap.data() as HouseholdDoc
  } catch (error) {
    console.error('Failed to get household:', error)
    return null
  }
}

// Subscribe to shopping list changes
export function subscribeToShoppingList(
  householdId: string,
  callback: (items: ShoppingItem[]) => void
): Unsubscribe | null {
  if (!db) return null

  const docRef = doc(db, 'households', householdId)
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as HouseholdDoc
      callback(data.shoppingList || [])
    }
  })
}

// Subscribe to tomorrow suggestions changes
export function subscribeToTomorrowSuggestions(
  householdId: string,
  callback: (suggestions: TomorrowSuggestion[]) => void
): Unsubscribe | null {
  if (!db) return null

  const docRef = doc(db, 'households', householdId)
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as HouseholdDoc
      callback(data.tomorrowSuggestions || [])
    }
  })
}

// Update shopping list
export async function updateShoppingList(
  householdId: string,
  items: ShoppingItem[]
): Promise<boolean> {
  if (!db) return false

  try {
    const docRef = doc(db, 'households', householdId)
    await setDoc(docRef, { shoppingList: items }, { merge: true })
    return true
  } catch (error) {
    console.error('Failed to update shopping list:', error)
    return false
  }
}

// Update tomorrow suggestions
export async function updateTomorrowSuggestions(
  householdId: string,
  suggestions: TomorrowSuggestion[]
): Promise<boolean> {
  if (!db) return false

  try {
    const docRef = doc(db, 'households', householdId)
    await setDoc(docRef, { tomorrowSuggestions: suggestions }, { merge: true })
    return true
  } catch (error) {
    console.error('Failed to update tomorrow suggestions:', error)
    return false
  }
}
