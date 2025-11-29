document.addEventListener('DOMContentLoaded', () => {
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  
  if (reserveButtons) {
    reserveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Prevent the default form submission or link behavior
        e.preventDefault(); 
        
        // Get the name of the listing from the data attribute
        const listingId = button.dataset.listingId;
        const listingName = button.dataset.listingName;
        
        // Change the button's state to "Reserved"
        button.textContent = 'Reserved ✓';
        button.classList.add('reserved');
        button.disabled = true;
      });
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const reserveButtons = document.querySelectorAll('.reserve-btn');

  reserveButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // optional: show reserved state instantly
      button.textContent = 'Reserved ✓';
      button.disabled = true;
      button.classList.add('reserved');
    });
  });
});
