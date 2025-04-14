import { NextRequest, NextResponse } from 'next/server';
import { getCompanyInfo, saveCompanyInfo, initializeDefaultCompanyInfo } from '@/services/companyService';
import { CompanyInfo } from '@/models/CompanyInfo';

/**
 * GET handler for company information
 */
export async function GET() {
  try {
    // Try to get existing company info
    let companyInfo = await getCompanyInfo();
    
    // If no company info exists, initialize with defaults
    if (!companyInfo) {
      try {
        companyInfo = await initializeDefaultCompanyInfo();
      } catch (initError) {
        console.error('Error initializing default company info:', initError);
        // Return a default company info object if initialization fails
        companyInfo = {
          name: 'MasterStock Inc.',
          shortName: 'MS',
          tagline: 'Enterprise Inventory Management Solutions',
          plan: {
            name: 'Enterprise Plan',
            expiryDate: new Date(new Date().getFullYear() + 1, 11, 31),
            maxUsers: 15,
            currentUsers: 12,
            isActive: true
          }
        };
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: companyInfo 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch company information',
        fallbackData: {
          name: 'MasterStock Inc.',
          shortName: 'MS',
          tagline: 'Enterprise Inventory Management Solutions',
          plan: {
            name: 'Enterprise Plan',
            expiryDate: new Date(new Date().getFullYear() + 1, 11, 31),
            maxUsers: 15,
            currentUsers: 12,
            isActive: true
          }
        }
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}

/**
 * POST handler to create or update company information
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.plan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }
    
    // Save company info
    const savedCompanyInfo = await saveCompanyInfo(data as CompanyInfo);
    
    return NextResponse.json({ 
      success: true, 
      data: savedCompanyInfo,
      message: 'Company information saved successfully'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in POST /api/company:', error);
    
    // Return the original data if saving fails
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save company information',
        originalData: data // Return the original data so client can recover
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}