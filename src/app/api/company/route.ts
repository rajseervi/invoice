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
      companyInfo = await initializeDefaultCompanyInfo();
    }
    
    return NextResponse.json({ success: true, data: companyInfo });
  } catch (error) {
    console.error('Error in GET /api/company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company information' },
      { status: 500 }
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
        { status: 400 }
      );
    }
    
    // Save company info
    const savedCompanyInfo = await saveCompanyInfo(data as CompanyInfo);
    
    return NextResponse.json({ 
      success: true, 
      data: savedCompanyInfo,
      message: 'Company information saved successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save company information' },
      { status: 500 }
    );
  }
}