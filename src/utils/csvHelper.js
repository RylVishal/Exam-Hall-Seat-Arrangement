export const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx];
    });
    return obj;
  });

  return data;
};

// 🔥 FIXED: Clean export without Firebase-specific fields
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Remove unwanted fields and clean data
  const cleanData = data.map(item => {
    const cleaned = { ...item };
    
    // Remove Firebase-specific fields
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.studentId;
    delete cleaned.staffId;
    delete cleaned.examId;
    delete cleaned.type;
    
    // Convert any remaining objects to strings
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] && typeof cleaned[key] === 'object') {
        if (cleaned[key].seconds) {
          // Convert Firestore Timestamp to readable date
          const date = new Date(cleaned[key].seconds * 1000);
          cleaned[key] = date.toLocaleString();
        } else {
          cleaned[key] = JSON.stringify(cleaned[key]);
        }
      }
    });
    
    return cleaned;
  });

  const headers = Object.keys(cleanData[0]).join(',');
  const rows = cleanData.map(obj => 
    Object.values(obj).map(val => {
      // Escape commas and quotes in values
      const stringVal = String(val || '');
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseCSV(event.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};