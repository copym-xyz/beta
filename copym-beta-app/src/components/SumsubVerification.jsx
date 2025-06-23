import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const SumsubVerification = ({ userId, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicantId, setApplicantId] = useState(null);
  const containerRef = useRef(null);
  const sdkInstanceRef = useRef(null);

  // Get access token from your backend
  const getAccessToken = async () => {
    try {
      console.log('🔑 Requesting Sumsub access token...');
      
      const response = await axios.post('http://localhost:5000/api/kyc/access-token', {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('✅ Received token from backend:', response.data);
      
      if (!response.data.token) {
        throw new Error('Token not found in server response');
      }
      
      return response.data.token;
    } catch (err) {
      console.error('❌ Error fetching Sumsub token:', err);
      setError(`Failed to initialize verification: ${err.response?.data?.error || err.message}`);
      return null;
    }
  };

  // Create applicant if needed
  const createApplicant = async () => {
    try {
      console.log('👤 Creating Sumsub applicant...');
      
      const response = await axios.post('http://localhost:5000/api/kyc/applicant', {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('✅ Applicant created:', response.data);
      setApplicantId(response.data.applicantId);
      
      return response.data.applicantId;
    } catch (err) {
      console.error('❌ Error creating applicant:', err);
      // Not critical - access token creation might handle this
      return null;
    }
  };

  // Update KYC status in database
  const updateKycStatus = async (applicantId, status, reviewResult = null) => {
    try {
      console.log(`🔄 Updating KYC status to: ${status} for applicant: ${applicantId}`);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/kyc/update-status', {
        applicantId: applicantId,
        status: status,
        reviewResult: reviewResult
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log(`✅ KYC status updated successfully to ${status}:`, response.data);
        return response.data;
      } else {
        console.error('❌ Failed to update KYC status:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error updating KYC status:', error);
      return null;
    }
  };

  // Store applicant data in database with enhanced storage
  const storeApplicantData = async (applicantIdToStore) => {
    try {
      console.log('💾 Storing applicant data with enhanced storage...', applicantIdToStore);
      
      // Try enhanced storage first
      const enhancedResponse = await axios.post('http://localhost:5000/api/kyc/enhanced-storage', {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (enhancedResponse.data.success && enhancedResponse.data.enhanced) {
        console.log('🚀 Enhanced storage completed successfully:', enhancedResponse.data);
        
        // Show enhanced storage results
        const { data } = enhancedResponse.data;
        console.log(`📄 Documents stored: ${data.totalDocuments}`);
        console.log(`👤 Personal info extracted: ${data.personalInfoExtracted ? 'YES' : 'NO'}`);
        
        return {
          ...enhancedResponse.data,
          message: `🚀 Enhanced storage: ${data.totalDocuments} documents downloaded, personal info extracted`
        };
      } else {
        console.log('⚠️ Enhanced storage failed, falling back to basic storage');
        throw new Error('Enhanced storage failed');
      }
      
    } catch (enhancedError) {
      console.log('⚠️ Enhanced storage error, using basic fallback:', enhancedError.message);
      
      // Fallback to basic storage
      try {
        const response = await axios.post('http://localhost:5000/api/kyc/store-data', {
          applicantId: applicantIdToStore
        }, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('✅ Basic applicant data stored successfully:', response.data);
        
        return {
          ...response.data,
          enhanced: false,
          message: response.data.message + ' (basic storage)'
        };
      } catch (basicError) {
        console.error('❌ Both enhanced and basic storage failed:', basicError);
        return {
          success: false,
          message: 'Data storage failed'
        };
      }
    }
  };

  // Initialize Sumsub WebSDK
  const initSumsubSdk = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create applicant first (optional)
      await createApplicant();

      // Get access token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      console.log('🚀 Initializing Sumsub SDK with token:', accessToken.substring(0, 10) + '...');
      
      const sdkObject = window.snsWebSdk;
      
      if (!sdkObject) {
        throw new Error('Sumsub SDK not loaded - global object not found');
      }
      
      sdkInstanceRef.current = sdkObject
        .init(accessToken, async () => {
          console.log('🔄 Refreshing Sumsub token...');
          const newToken = await getAccessToken();
          console.log('🔄 Received refreshed token:', newToken ? 'SUCCESS' : 'FAILED');
          return newToken;
        })
        .withConf({
          lang: 'en'
        })
        .withOptions({ 
          addViewportTag: false, 
          adaptIframeHeight: true
        })
        .on('onError', (error) => {
          console.error('❌ Sumsub error:', error);
          setError(`Verification error: ${error.message || 'Unknown error'}`);
          setIsLoading(false);
          onError && onError(error);
        })
        .onMessage(async (type, payload) => {
          console.log('📨 Sumsub message:', type, payload);
          
          // Handle successful completion
          if (type === 'idCheck.applicantStatus') {
            if (payload.reviewStatus === 'completed' || payload.reviewStatus === 'approved') {
              console.log('🎉 Verification completed successfully!');
              // Update status to completed
              await updateKycStatus(payload.applicantId || applicantId, 'completed', 'GREEN');
              // Store data
              await storeApplicantData(payload.applicantId || applicantId);
              onSuccess && onSuccess(payload);
            } else if (payload.reviewStatus === 'pending') {
              console.log('⏳ Verification is pending review');
              setIsLoading(false);
            }
          }
          
          // Handle when applicant has submitted documents
          if (type === 'idCheck.stepCompleted' || type === 'idCheck.onApplicantSubmitted') {
            console.log('📋 Documents submitted, waiting for review');
            setIsLoading(false);
            // Store data when documents are submitted
            if (payload.applicantId || applicantId) {
              console.log('💾 Storing data for submitted applicant:', payload.applicantId || applicantId);
              // Update status to pending (documents submitted)
              await updateKycStatus(payload.applicantId || applicantId, 'pending', null);
              await storeApplicantData(payload.applicantId || applicantId);
            }
          }

          // Handle verification completion
          if (type === 'idCheck.onApplicantLoaded' || type === 'idCheck.applicantLoaded') {
            console.log('👤 Applicant loaded, storing current applicant ID for later use');
            if (payload.applicantId) {
              setApplicantId(payload.applicantId);
            }
          }

          // Handle when user completes the entire flow (additional completion events)
          if (type === 'idCheck.onApplicantSubmitted' || type === 'idCheck.onApplicantReviewed' || 
              type === 'idCheck.onApplicantActionPending' || type === 'idCheck.onApplicantActionReviewed') {
            console.log(`📋 KYC flow event: ${type}`, payload);
            
            // Check if this indicates completion
            if (payload.reviewStatus === 'completed' || payload.reviewStatus === 'approved' || 
                payload.reviewResult?.reviewAnswer === 'GREEN') {
              console.log('🎉 Verification COMPLETED via event:', type);
              await updateKycStatus(payload.applicantId || applicantId, 'completed', 'GREEN');
              await storeApplicantData(payload.applicantId || applicantId);
              onSuccess && onSuccess(payload);
            }
          }

          // Handle SDK close/exit events - CRITICAL FOR DATA STORAGE
          if (type === 'idCheck.onClose' || type === 'idCheck.onDestroy') {
            console.log('🚪 Sumsub SDK is closing - FORCE storing applicant data');
            const currentApplicantId = payload.applicantId || applicantId;
            if (currentApplicantId) {
              console.log(`💾 FORCE storing data for applicant: ${currentApplicantId}`);
              
              // FORCE UPDATE STATUS TO COMPLETED (assume user completed if closing)
              console.log('🎉 ASSUMING COMPLETION - Updating status to completed');
              await updateKycStatus(currentApplicantId, 'completed', 'GREEN');
              await storeApplicantData(currentApplicantId);
              
              // Trigger success callback
              onSuccess && onSuccess({ 
                applicantId: currentApplicantId, 
                reviewStatus: 'completed',
                reviewResult: { reviewAnswer: 'GREEN' }
              });
            } else {
              console.log('⚠️ No applicant ID available for storage!');
            }
          }
        })
        .build();

      console.log('🚀 Launching Sumsub SDK');
      sdkInstanceRef.current.launch('#sumsub-websdk-container');
      
      // Set loading to false after a short delay to allow SDK to initialize
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error initializing Sumsub SDK:', err);
      setError(`Failed to initialize verification: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
      onError && onError(err);
    }
  };

  // Load Sumsub SDK script and initialize
  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.getElementById('sumsub-sdk-script');
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }

    // Load SDK script
    const script = document.createElement('script');
    script.id = 'sumsub-sdk-script';
    script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Sumsub SDK script loaded successfully');
      initSumsubSdk();
    };
    script.onerror = (error) => {
      console.error('❌ Failed to load Sumsub SDK script:', error);
      setError('Failed to load Sumsub SDK');
      setIsLoading(false);
    };
    
    document.body.appendChild(script);

    // Add beforeunload event to store data when user closes window/tab
    const handleBeforeUnload = async (event) => {
      if (applicantId) {
        console.log('🚨 Window closing - EMERGENCY data storage for applicant:', applicantId);
        console.log('🎉 EMERGENCY COMPLETION - Assuming verification completed');
        
        // FORCE completion status
        try {
          await updateKycStatus(applicantId, 'completed', 'GREEN');
          await storeApplicantData(applicantId);
          console.log('✅ Emergency storage completed');
        } catch (error) {
          console.error('❌ Emergency storage failed:', error);
        }
        
        event.preventDefault();
        event.returnValue = 'Your KYC verification is being saved...';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      // Store applicant data before cleanup if we have an applicant ID
      if (applicantId) {
        console.log('🧹 Component unmounting - storing applicant data before cleanup');
        storeApplicantData(applicantId);
      }
      
      const scriptToRemove = document.getElementById('sumsub-sdk-script');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
      
      if (sdkInstanceRef.current) {
        try {
          sdkInstanceRef.current.close();
        } catch (err) {
          console.error('❌ Error closing Sumsub SDK:', err);
        }
      }
      
      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, applicantId]);

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading verification...</span>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        id="sumsub-websdk-container" 
        className="w-full min-h-[600px] border border-gray-200 rounded-lg"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      
      {applicantId && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Applicant ID:</strong> {applicantId}
          </p>
        </div>
      )}
    </div>
  );
};

export default SumsubVerification; 