document.addEventListener('DOMContentLoaded', function() {
     // Initialize variables
     const form = document.getElementById('prediction-form');
     const resultSection = document.getElementById('result-section');
     const loader = document.getElementById('loader');
     const predictBtn = document.getElementById('predict-btn');
     const dialIndicator = document.getElementById('dial-indicator');
     const dialValue = document.getElementById('dial-value');
     const predictionMessage = document.getElementById('prediction-message');
     const recommendationsList = document.getElementById('recommendations');
     const revenueMeter = document.getElementById('revenue-meter');
     const revenueValue = document.getElementById('revenue-value');
     const timelineSteps = document.querySelectorAll('.step');
     const heatmapGrid = document.getElementById('heatmap-grid');
 
     // Initialize Seasonal Heatmap
     initHeatmap();
 
     // Add event listeners
     form.addEventListener('submit', handleFormSubmit);
     
     // Input event listeners for dynamic updates
     document.getElementById('avg_price_per_room').addEventListener('input', updateRevenueImpact);
     document.getElementById('no_of_week_nights').addEventListener('input', updateRevenueImpact);
     document.getElementById('no_of_weekend_nights').addEventListener('input', updateRevenueImpact);
     document.getElementById('lead_time').addEventListener('input', updateCancellationRisk);
     document.getElementById('no_of_special_request').addEventListener('input', updateCancellationRisk);
 
     // Initialize the form with default values
     document.getElementById('lead_time').value = 15;
     document.getElementById('no_of_special_request').value = 0;
     document.getElementById('avg_price_per_room').value = 120;
     document.getElementById('no_of_week_nights').value = 3;
     document.getElementById('no_of_weekend_nights').value = 2;
     
     // Initial calculations
     updateRevenueImpact();
     
     /**
      * Initializes the seasonal heatmap
      */
     function initHeatmap() {
         // Seasonal demand data (higher values = higher demand)
         const seasonalData = [
             5, 4, 6, 7, 8, 9, 10, 10, 8, 7, 5, 6  // Jan to Dec
         ];
         
         heatmapGrid.innerHTML = '';
         seasonalData.forEach((value, index) => {
             const cell = document.createElement('div');
             cell.className = 'heatmap-cell';
             // Calculate color based on value (5-10 range)
             const blueIntensity = Math.floor(((value - 5) / 5) * 255);
             cell.style.backgroundColor = `rgb(${255 - blueIntensity}, ${255 - blueIntensity}, 255)`;
             cell.title = `${getMonthName(index+1)}: ${value}/10 demand`;
             heatmapGrid.appendChild(cell);
         }); 
 
         // Add event listener to highlight current month
         document.getElementById('arrival_month').addEventListener('change', (e) => {
             const selectedMonth = parseInt(e.target.value);
             const cells = heatmapGrid.querySelectorAll('.heatmap-cell');
             
             cells.forEach((cell, index) => {
                 if (index === selectedMonth - 1) {
                     cell.style.transform = 'scale(1.2)';
                     cell.style.border = '2px solid #c4a35a';
                 } else {
                     cell.style.transform = 'scale(1)';
                     cell.style.border = 'none';
                 }
             });
         });
     }
     
     /**
      * Handles form submission
      * @param {Event} e - Form submit event
      */
     function handleFormSubmit(e) {
         e.preventDefault();
         
         // Show loader
         loader.classList.add('active');
         
         // Update timeline
         timelineSteps.forEach((step, index) => {
             if (index === 1) {
                 step.classList.add('active');
             } else if (index === 0) {
                 step.classList.remove('active');
             }
         });
         
         // Simulate API call delay (replace with actual API call in production)
         setTimeout(() => {
             // Calculate prediction using form values
             const prediction = calculatePrediction();
             
             // Update timeline
             timelineSteps.forEach((step, index) => {
                 if (index === 2) {
                     step.classList.add('active');
                 } else if (index === 1) {
                     step.classList.remove('active');
                 }
             });
             
             // Show result
             displayResult(prediction);
             
             // Hide loader
             loader.classList.remove('active');
             
             // Show result section
             resultSection.style.display = 'block';
             resultSection.scrollIntoView({ behavior: 'smooth' });
         }, 2000);
     }
     
     /**
      * Calculates prediction based on form inputs
      * @returns {number} - Cancellation probability (0-100)
      */
     function calculatePrediction() {
         // Get form values
         const leadTime = parseInt(document.getElementById('lead_time').value);
         const specialRequests = parseInt(document.getElementById('no_of_special_request').value);
         const price = parseInt(document.getElementById('avg_price_per_room').value);
         const arrivalMonth = parseInt(document.getElementById('arrival_month').value);
         const marketSegment = parseInt(document.getElementById('market_segment_type').value);
         const weekNights = parseInt(document.getElementById('no_of_week_nights').value);
         const weekendNights = parseInt(document.getElementById('no_of_weekend_nights').value);
         const mealPlan = parseInt(document.getElementById('type_of_meal_plan').value);
         const roomType = parseInt(document.getElementById('room_type_reserved').value);
         
         // Simple weighted formula to simulate ML model prediction
         // Note: In a real app, this would call an API with a trained model
         let probability = 0;
         
         // Lead time has strong correlation - longer lead times increase cancellation risk
         probability += leadTime * 0.2;
         
         // Special requests reduce cancellation risk
         probability -= specialRequests * 8;
         
         // Higher prices increase cancellation risk
         probability += price * 0.1;
         
         // Seasonal factors (higher in peak seasons)
         if (arrivalMonth >= 6 && arrivalMonth <= 8) {
             probability += 5; // Summer months
         } else if (arrivalMonth == 12 || arrivalMonth <= 1) {
             probability += 10; // Holiday season
         }
         
         // Market segment impact
         if (marketSegment === 4) { // Online
             probability += 15; // Online bookings cancel more
         } else if (marketSegment === 2) { // Corporate
             probability -= 10; // Corporate bookings cancel less
         }
         
         // Longer stays reduce cancellation risk
         probability -= (weekNights + weekendNights) * 2;
         
         // Meal plan impact
         if (mealPlan === 3) { // Not selected
             probability += 5;
         } else if (mealPlan === 2) { // Full board
             probability -= 10;
         }
         
         // Room type impact (higher room types = less cancellations)
         probability -= roomType * 3;
         
         // Ensure within 0-100 range
         probability = Math.max(5, Math.min(95, probability));
         
         return Math.round(probability);
     }
     
     /**
      * Displays the prediction result
      * @param {number} probability - Cancellation probability
      */
     function displayResult(probability) {
         // Update dial indicator
         const rotation = (probability / 100) * 180;
         dialIndicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
         dialValue.textContent = `${probability}%`;
         
         // Update prediction message
         predictionMessage.innerHTML = '';
         predictionMessage.className = 'prediction-message';
         
         if (probability > 50) {
             predictionMessage.classList.add('cancel');
             predictionMessage.innerHTML = `
                 <h3><i class="fas fa-times-circle" style="color: var(--danger-color);"></i> Likely to Cancel</h3>
                 <p>Our analysis suggests this reservation has a <strong>${probability}%</strong> chance of cancellation.</p>
                 <p>Consider implementing proactive retention strategies to secure this booking.</p>
             `;
         } else {
             predictionMessage.classList.add('confirmed');
             predictionMessage.innerHTML = `
                 <h3><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Likely to Confirm</h3>
                 <p>This reservation has a strong <strong>${100-probability}%</strong> chance of being confirmed.</p>
                 <p>This guest is likely to honor their booking and complete their stay.</p>
             `;
         }
         
         // Update recommendations
         recommendationsList.innerHTML = '';
         
         // Get form values for recommendations
         const price = parseInt(document.getElementById('avg_price_per_room').value);
         const leadTime = parseInt(document.getElementById('lead_time').value);
         const weekNights = parseInt(document.getElementById('no_of_week_nights').value);
         const weekendNights = parseInt(document.getElementById('no_of_weekend_nights').value);
         const totalNights = weekNights + weekendNights;
         
         if (probability > 75) {
             // High risk recommendations
             addRecommendation('Request a partial pre-payment or deposit to secure the booking');
             addRecommendation(`Send a personalized email offering a room upgrade or ${Math.round(totalNights / 3)} complimentary night(s)`);
             addRecommendation('Implement flexible cancellation policy with partial refund options');
         } else if (probability > 50) {
             // Moderate risk recommendations
             addRecommendation('Send booking confirmation reminder with property highlights');
             addRecommendation(`Offer inclusive meal package at a ${Math.round(price * 0.1)}% discount`);
             addRecommendation('Provide destination guide and local experience recommendations');
         } else if (probability > 25) {
             // Low risk recommendations
             addRecommendation('Send pre-stay email with check-in details and amenity information');
             addRecommendation('Offer upsell opportunities like airport transfers or spa services');
             addRecommendation('Highlight loyalty program benefits if applicable');
         } else {
             // Very low risk recommendations
             addRecommendation('Send standard pre-arrival email with check-in instructions');
             addRecommendation('Consider this room secured and allocate accordingly');
             addRecommendation('Check for upsell opportunities closer to arrival date');
         }
     }
     
     /**
      * Adds a recommendation to the list
      * @param {string} text - Recommendation text
      */
     function addRecommendation(text) {
         const li = document.createElement('li');
         li.textContent = text;
         recommendationsList.appendChild(li);
     }
     
     /**
      * Updates the revenue impact meter
      */
     function updateRevenueImpact() {
         const price = parseInt(document.getElementById('avg_price_per_room').value) || 0;
         const weekNights = parseInt(document.getElementById('no_of_week_nights').value) || 0;
         const weekendNights = parseInt(document.getElementById('no_of_weekend_nights').value) || 0;
         
         const totalNights = weekNights + weekendNights;
         const totalRevenue = price * totalNights;
         
         // Update meter width (max at $2000)
         const meterWidth = Math.min(100, (totalRevenue / 2000) * 100);
         revenueMeter.style.width = `${meterWidth}%`;
         
         // Update value
         revenueValue.textContent = totalRevenue;
     }
     
     /**
      * Updates cancellation risk indicators based on input
      */
     function updateCancellationRisk() {
         // This is a simplified example - in a real app, this would call the prediction API
         const leadTime = parseInt(document.getElementById('lead_time').value) || 0;
         const specialRequests = parseInt(document.getElementById('no_of_special_request').value) || 0;
         
         // Simple visual indicator - not the actual prediction
         if (leadTime > 60 && specialRequests < 2) {
             highlightInput(document.getElementById('lead_time'), 'warning');
         } else {
             resetInputHighlight(document.getElementById('lead_time'));
         }
         
         if (specialRequests == 0) {
             highlightInput(document.getElementById('no_of_special_request'), 'warning');
         } else {
             resetInputHighlight(document.getElementById('no_of_special_request'));
         }
     }
     
     /**
      * Highlights an input with a specific state
      * @param {HTMLElement} input - Input element
      * @param {string} state - State class ('warning', 'success', etc.)
      */
     function highlightInput(input, state) {
         input.classList.add(state);
     }
     
     /**
      * Resets input highlighting
      * @param {HTMLElement} input - Input element
      */
     function resetInputHighlight(input) {
         input.classList.remove('warning', 'success');
     }
     
     /**
      * Gets month name from number
      * @param {number} month - Month number (1-12)
      * @returns {string} - Month name
      */
     function getMonthName(month) {
         const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
         return months[month - 1];
     }
 });