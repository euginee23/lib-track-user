import React from 'react';

const LibraryHours = () => {
  const hours = [
    { day: 'Monday - Friday', time: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', time: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', time: '10:00 AM - 3:00 PM' }
  ];

  return (
    <div className="library-hours-widget" style={{
      backgroundColor: 'rgba(10, 112, 117, 0.1)',
      borderRadius: '8px',
      padding: '10px',
      marginTop: '10px'
    }}>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <tbody>
          {hours.map((item, index) => (
            <tr key={index} style={{borderBottom: index < hours.length - 1 ? '1px solid rgba(12, 150, 156, 0.2)' : 'none'}}>
              <td style={{padding: '8px 0'}}>{item.day}</td>
              <td style={{padding: '8px 0', textAlign: 'right'}}>{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibraryHours;