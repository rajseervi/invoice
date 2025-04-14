import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { CompanyInfo } from '@/models/CompanyInfo';

const COMPANY_COLLECTION = 'companyInfo';

/**
 * Get company information
 * @returns Promise with company information
 */
export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    // Since we expect only one company document, we'll query with limit(1)
    const companyQuery = query(collection(db, COMPANY_COLLECTION), limit(1));
    const snapshot = await getDocs(companyQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as CompanyInfo;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
};

/**
 * Get company information by ID
 * @param id Company document ID
 * @returns Promise with company information
 */
export const getCompanyInfoById = async (id: string): Promise<CompanyInfo | null> => {
  try {
    const docRef = doc(db, COMPANY_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as CompanyInfo;
  } catch (error) {
    console.error('Error fetching company info by ID:', error);
    throw error;
  }
};

/**
 * Create or update company information
 * @param companyInfo Company information object
 * @returns Promise with the updated company information
 */
export const saveCompanyInfo = async (companyInfo: CompanyInfo): Promise<CompanyInfo> => {
  try {
    const now = new Date();
    
    // If we have an ID, update the existing document
    if (companyInfo.id) {
      const docRef = doc(db, COMPANY_COLLECTION, companyInfo.id);
      
      // Add timestamps
      const updatedCompanyInfo = {
        ...companyInfo,
        updatedAt: serverTimestamp()
      };
      
      // Remove the ID from the data to be saved
      const { id, ...dataToSave } = updatedCompanyInfo;
      
      await updateDoc(docRef, dataToSave);
      return companyInfo;
    } 
    // Otherwise create a new document
    else {
      // Create a new document with a generated ID
      const newDocRef = doc(collection(db, COMPANY_COLLECTION));
      
      // Add timestamps
      const newCompanyInfo = {
        ...companyInfo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(newDocRef, newCompanyInfo);
      return { ...newCompanyInfo, id: newDocRef.id };
    }
  } catch (error) {
    console.error('Error saving company info:', error);
    throw error;
  }
};

/**
 * Initialize default company information if none exists
 * @returns Promise with the default company information
 */
export const initializeDefaultCompanyInfo = async (): Promise<CompanyInfo> => {
  try {
    // Check if company info already exists
    const existingInfo = await getCompanyInfo();
    
    if (existingInfo) {
      return existingInfo;
    }
    
    // Create default company info
    const defaultCompanyInfo: CompanyInfo = {
      name: 'MasterStock Inc.',
      shortName: 'MS',
      tagline: 'Enterprise Inventory Management Solutions',
      description: 'Streamline your inventory management with our powerful enterprise solution.',
      plan: {
        name: 'Enterprise Plan',
        expiryDate: new Date(new Date().getFullYear() + 1, 11, 31), // Dec 31 of next year
        maxUsers: 15,
        currentUsers: 12,
        isActive: true
      },
      contact: {
        email: 'support@masterstock.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
        website: 'www.masterstock.com'
      }
    };
    
    // Save the default company info
    return await saveCompanyInfo(defaultCompanyInfo);
  } catch (error) {
    console.error('Error initializing default company info:', error);
    throw error;
  }
};