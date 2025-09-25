import React, { useState, useEffect } from 'react';

function AIHealthPlanner({ user, onClose }) {
  const [healthPlan, setHealthPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState('weekly');
  const [userSymptoms, setUserSymptoms] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false); // Mock subscription status

  // Mock subscription check
  useEffect(() => {
    // In real app, check user's subscription status
    const mockSubscription = localStorage.getItem('premiumSubscription');
    setIsSubscribed(mockSubscription === 'true');
  }, []);

  const generateHealthPlan = async () => {
    if (!isSubscribed) {
      alert('This is a premium feature. Please subscribe to access AI Health Planner.');
      return;
    }

    setLoading(true);

    // Mock AI-generated health plan
    setTimeout(() => {
      const mockPlan = {
        id: Date.now(),
        type: planType,
        generatedAt: new Date().toISOString(),
        userProfile: {
          name: user.name,
          age: user.age,
          symptoms: userSymptoms,
          goals: userGoals
        },
        dietPlan: {
          breakfast: [
            'Oatmeal with fresh fruits and nuts',
            'Green tea or herbal tea',
            'Greek yogurt with honey'
          ],
          lunch: [
            'Grilled chicken or fish with vegetables',
            'Brown rice or quinoa',
            'Mixed green salad with olive oil dressing'
          ],
          dinner: [
            'Vegetable soup',
            'Whole grain bread',
            'Steamed vegetables with lean protein'
          ],
          snacks: [
            'Fresh fruits',
            'Nuts and seeds',
            'Vegetable sticks with hummus'
          ]
        },
        exercisePlan: [
          {
            day: 'Monday',
            activities: ['30 min brisk walk', '15 min stretching', 'Deep breathing exercises']
          },
          {
            day: 'Tuesday',
            activities: ['Light yoga', '20 min cycling', 'Meditation']
          },
          {
            day: 'Wednesday',
            activities: ['Swimming or water exercises', 'Core strengthening']
          },
          {
            day: 'Thursday',
            activities: ['30 min walk', 'Balance exercises', 'Relaxation']
          },
          {
            day: 'Friday',
            activities: ['Dance or aerobics', 'Flexibility training']
          },
          {
            day: 'Saturday',
            activities: ['Outdoor activities', 'Sports or games']
          },
          {
            day: 'Sunday',
            activities: ['Rest day', 'Gentle stretching', 'Mindfulness']
          }
        ],
        healthTips: [
          'Drink at least 8 glasses of water daily',
          'Get 7-8 hours of quality sleep',
          'Practice stress management techniques',
          'Take regular breaks from screen time',
          'Maintain good posture throughout the day'
        ],
        medications: userSymptoms ? [
          'Continue prescribed medications as directed',
          'Take vitamins with meals for better absorption',
          'Monitor blood pressure if applicable'
        ] : [],
        warnings: [
          'Consult your doctor before starting any new exercise routine',
          'Stop any activity if you experience pain or discomfort',
          'This plan is AI-generated and should complement, not replace, professional medical advice'
        ]
      };

      setHealthPlan(mockPlan);
      setLoading(false);

      // Save to localStorage
      const savedPlans = JSON.parse(localStorage.getItem('healthPlans') || '[]');
      savedPlans.push(mockPlan);
      localStorage.setItem('healthPlans', JSON.stringify(savedPlans));
    }, 3000);
  };

  const handleSubscribe = () => {
    // Mock subscription process
    if (confirm('Subscribe to Premium for ₹299/month to access AI Health Planner and other premium features?')) {
      localStorage.setItem('premiumSubscription', 'true');
      setIsSubscribed(true);
      alert('Subscription successful! You now have access to premium features.');
    }
  };

  if (!isSubscribed) {
    return (
      <div className="ai-health-planner-overlay">
        <div className="ai-health-planner-modal">
          <div className="premium-header">
            <div className="premium-icon">
              <ion-icon name="diamond-outline"></ion-icon>
            </div>
            <h3>AI Health Planner</h3>
            <p>Premium Feature</p>
            <button className="close-planner-btn" onClick={onClose}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>

          <div className="premium-content">
            <div className="premium-features">
              <h4>Unlock Premium Features</h4>
              <div className="features-list">
                <div className="feature-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Personalized weekly/monthly health plans</span>
                </div>
                <div className="feature-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>AI-generated diet recommendations</span>
                </div>
                <div className="feature-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Custom exercise routines</span>
                </div>
                <div className="feature-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Health tracking and progress monitoring</span>
                </div>
                <div className="feature-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Priority customer support</span>
                </div>
              </div>

              <div className="pricing">
                <div className="price">₹299<span>/month</span></div>
                <p>Cancel anytime • 7-day free trial</p>
              </div>

              <button className="subscribe-btn" onClick={handleSubscribe}>
                <ion-icon name="diamond-outline"></ion-icon>
                Subscribe to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-health-planner-overlay">
      <div className="ai-health-planner-modal">
        <div className="ai-health-planner-header">
          <h3>
            <ion-icon name="fitness-outline"></ion-icon>
            AI Health Planner
          </h3>
          <div className="premium-badge">
            <ion-icon name="diamond-outline"></ion-icon>
            Premium
          </div>
          <button className="close-planner-btn" onClick={onClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <div className="ai-health-planner-content">
          {!healthPlan ? (
            <div className="plan-generator">
              <h4>Generate Your Personalized Health Plan</h4>
              
              <div className="form-group">
                <label>Plan Duration</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="form-select"
                >
                  <option value="weekly">Weekly Plan</option>
                  <option value="monthly">Monthly Plan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Symptoms or Health Concerns</label>
                <textarea
                  value={userSymptoms}
                  onChange={(e) => setUserSymptoms(e.target.value)}
                  placeholder="e.g., back pain, stress, fatigue, diabetes..."
                  className="form-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Health Goals</label>
                <textarea
                  value={userGoals}
                  onChange={(e) => setUserGoals(e.target.value)}
                  placeholder="e.g., lose weight, improve fitness, better sleep..."
                  className="form-textarea"
                  rows="3"
                ></textarea>
              </div>

              <button 
                className="generate-plan-btn"
                onClick={generateHealthPlan}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <ion-icon name="sparkles-outline"></ion-icon>
                    Generate AI Health Plan
                  </>
                )}
              </button>

              {loading && (
                <div className="generation-status">
                  <p>🤖 AI is analyzing your profile...</p>
                  <p>📊 Creating personalized recommendations...</p>
                  <p>🎯 Optimizing for your goals...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="health-plan-display">
              <div className="plan-header">
                <h4>Your Personalized {healthPlan.type} Health Plan</h4>
                <p>Generated on {new Date(healthPlan.generatedAt).toLocaleDateString()}</p>
                <button 
                  className="new-plan-btn"
                  onClick={() => setHealthPlan(null)}
                >
                  Generate New Plan
                </button>
              </div>

              <div className="plan-sections">
                <div className="plan-section">
                  <h5>
                    <ion-icon name="nutrition-outline"></ion-icon>
                    Diet Plan
                  </h5>
                  <div className="diet-plan">
                    <div className="meal-section">
                      <h6>Breakfast</h6>
                      <ul>
                        {healthPlan.dietPlan.breakfast.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meal-section">
                      <h6>Lunch</h6>
                      <ul>
                        {healthPlan.dietPlan.lunch.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meal-section">
                      <h6>Dinner</h6>
                      <ul>
                        {healthPlan.dietPlan.dinner.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meal-section">
                      <h6>Healthy Snacks</h6>
                      <ul>
                        {healthPlan.dietPlan.snacks.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="plan-section">
                  <h5>
                    <ion-icon name="fitness-outline"></ion-icon>
                    Exercise Plan
                  </h5>
                  <div className="exercise-plan">
                    {healthPlan.exercisePlan.map((day, index) => (
                      <div key={index} className="day-plan">
                        <h6>{day.day}</h6>
                        <ul>
                          {day.activities.map((activity, actIndex) => (
                            <li key={actIndex}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="plan-section">
                  <h5>
                    <ion-icon name="bulb-outline"></ion-icon>
                    Health Tips
                  </h5>
                  <ul className="health-tips">
                    {healthPlan.healthTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {healthPlan.medications.length > 0 && (
                  <div className="plan-section">
                    <h5>
                      <ion-icon name="medical-outline"></ion-icon>
                      Medication Reminders
                    </h5>
                    <ul className="medications">
                      {healthPlan.medications.map((med, index) => (
                        <li key={index}>{med}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="plan-section warnings">
                  <h5>
                    <ion-icon name="warning-outline"></ion-icon>
                    Important Notes
                  </h5>
                  <ul className="warnings-list">
                    {healthPlan.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIHealthPlanner;