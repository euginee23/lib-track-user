import React, { useState } from 'react';

const DynamicFAQ = (props) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // This would normally come from an API that admin can update
  const faqData = [
    {
      id: 1,
      question: "How many books can I borrow at once?",
      answer: "Students can borrow up to 5 books at a time. Faculty members can borrow up to 10 books."
    },
    {
      id: 2,
      question: "How long can I keep a borrowed book?",
      answer: "The standard loan period is 14 days for students and 30 days for faculty. Books can be renewed online if no holds are placed."
    },
    {
      id: 3,
      question: "What are the library fines for overdue books?",
      answer: "Overdue fines are ₱5.00 per day per book. After 30 days overdue, the book is considered lost and replacement fees apply."
    },
    {
      id: 4,
      question: "Can I access library resources remotely?",
      answer: "Yes! You can access our digital collections, databases, and e-books through the online portal using your student credentials."
    }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="dynamic-faq" style={{
      marginTop: '10px'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
          Click on any question to see the answer:
        </p>
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        {faqData.map((faq) => (
          <div
            key={faq.id}
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => toggleFaq(faq.id)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: '#0A7075',
                fontWeight: '500'
              }}
            >
              <span style={{ flex: 1, paddingRight: '8px' }}>
                {faq.question}
              </span>
              <span style={{ 
                fontSize: '0.8rem',
                transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>
            
            {expandedFaq === faq.id && (
              <div style={{
                padding: '0 12px 12px 12px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#ffffff'
              }}>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '0.8rem', 
                  lineHeight: '1.4',
                  color: '#555'
                }}>
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button
          onClick={() => {
            const message = props.actionProvider.createChatbotMessage(
              "For more questions, please contact the library staff at the circulation desk or email library@wmsu.edu.ph"
            );
            props.actionProvider.updateChatbotState(message);
          }}
          style={{
            backgroundColor: '#0C969C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
        >
          Need More Help?
        </button>
      </div>
    </div>
  );
};

export default DynamicFAQ;