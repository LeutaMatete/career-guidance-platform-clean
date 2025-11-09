import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [collectionsData, setCollectionsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('Connected to Firebase successfully!');
      await checkCollections();
    } catch (error) {
      setConnectionStatus(`Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCollections = async () => {
    const collectionsToCheck = ['users', 'institutions', 'students', 'companies', 'courses', 'applications', 'jobs'];
    const results = {};

    for (const collectionName of collectionsToCheck) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        results[collectionName] = {
          exists: true,
          count: querySnapshot.size,
          sample: querySnapshot.docs.slice(0, 3).map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        };
      } catch (error) {
        results[collectionName] = {
          exists: false,
          error: error.message
        };
      }
    }

    setCollectionsData(results);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Testing Database Connection...</h3>
        <p>Please wait while we connect to your Firebase project...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Database Connection Status</h2>
      
      <div style={{
        padding: '15px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>
          {connectionStatus}
        </h3>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Project: careerguide-lesotho-7207f
        </p>
      </div>

      <h3>Firestore Collections Status:</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        {Object.entries(collectionsData).map(([collectionName, data]) => (
          <div key={collectionName} style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: data.exists ? '#f8f9fa' : '#fff3cd'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h4 style={{
                textTransform: 'capitalize',
                margin: 0,
                color: data.exists ? '#28a745' : '#856404'
              }}>
                {collectionName}
              </h4>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: data.exists ? '#28a745' : '#ffc107',
                color: 'white'
              }}>
                {data.exists ? `${data.count} docs` : 'Missing'}
              </span>
            </div>

            {data.exists ? (
              <div>
                <p><strong>Documents:</strong> {data.count}</p>
                {data.count > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Sample Data:</strong>
                    {data.sample.map((doc, index) => (
                      <div key={doc.id} style={{
                        padding: '8px',
                        margin: '5px 0',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef',
                        fontSize: '12px'
                      }}>
                        <div><strong>ID:</strong> {doc.id}</div>
                        {doc.data.name && <div><strong>Name:</strong> {doc.data.name}</div>}
                        {doc.data.email && <div><strong>Email:</strong> {doc.data.email}</div>}
                        {doc.data.role && <div><strong>Role:</strong> {doc.data.role}</div>}
                        {doc.data.createdAt && <div><strong>Created:</strong> {new Date(doc.data.createdAt).toLocaleDateString()}</div>}
                      </div>
                    ))}
                    {data.count > 3 && (
                      <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                        ... and {data.count - 3} more documents
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#856404' }}>
                <p><strong>Status:</strong> Collection not found or inaccessible</p>
                {data.error && (
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>
                    <strong>Error:</strong> {data.error}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={testDatabaseConnection}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Connection Again
      </button>
    </div>
  );
};

export default DatabaseTest;