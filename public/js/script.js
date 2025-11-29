'use strict';

(() => {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      },
      false
    );
  });
})();
// =================================================================
// LOGIC FOR THE "DISPLAY TOTAL AFTER TAXES" TOGGLE SWITCH
// =================================================================

function updatePrices() {
    // 1. Get the toggle switch and the tax info elements
    const taxToggle = document.getElementById('switchCheckDefault');
    const priceElements = document.querySelectorAll('.listing-card .card-text');
    const taxInfoElements = document.querySelectorAll('.tax-info');

    // If the toggle element doesn't exist, exit the function
    if (!taxToggle) return; 

    const isChecked = taxToggle.checked;

    // Set the visibility of the small "+18%GST" text
    taxInfoElements.forEach(taxInfo => {
        // 'inline' for visibility when checked, 'none' for hiding
        taxInfo.style.display = isChecked ? 'inline' : 'none';
    });
    
    // 2. Loop through each listing card's price text
    priceElements.forEach(pElement => {
        // Check if the element contains the required price data (to avoid errors)
        if (!pElement.dataset.originalPrice) {
             // Extract the original price and store it as a data attribute 
             // for quick access on future toggles.
            
             // Look for the price in the existing innerHTML: &#8377; 4,000 / night
             const priceMatch = pElement.textContent.match(/₹\s*([\d,.]+)\s*\//);
             
             if (priceMatch && priceMatch[1]) {
                 const rawPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
                 pElement.dataset.originalPrice = rawPrice;
             } else {
                 // Skip if price cannot be found/parsed
                 return;
             }
        }
        
        // Retrieve the stored original price
        const originalPrice = parseFloat(pElement.dataset.originalPrice);
        const currencySymbol = '₹';
        const taxRate = 0.18; // Assuming 18% GST based on your tax-info
        
        // 3. Calculate the new price
        const totalTax = originalPrice * taxRate;
        const totalPrice = originalPrice + totalTax;
        
        // 4. Update the text display
        let newPriceText;

        if (isChecked) {
            // Display Total Price
            // Use 'total' to indicate it includes taxes
            newPriceText = `${currencySymbol} ${totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} total`;
        } else {
            // Display Nightly Price
            newPriceText = `${currencySymbol} ${originalPrice.toLocaleString("en-IN")} / night`;
        }

        // 5. Reconstruct the HTML to preserve the bold title and the tax-info <i> tag
        const titleHtml = pElement.querySelector('b').outerHTML;
        const taxInfoHtml = pElement.querySelector('.tax-info') ? pElement.querySelector('.tax-info').outerHTML : '';

        pElement.innerHTML = `${titleHtml} <br> ${newPriceText} ${taxInfoHtml}`;
    });
}

// 6. Listen for the 'change' event on the toggle switch on page load
document.addEventListener('DOMContentLoaded', () => {
    const taxToggle = document.getElementById('switchCheckDefault');

    if (taxToggle) {
        // Run once on load to set initial prices/visibility
        updatePrices();
        
        // Event listener for when the switch is clicked/changed
        taxToggle.addEventListener('change', updatePrices);
    }
});