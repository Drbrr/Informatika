document.addEventListener('DOMContentLoaded', function() {
    // Initialize order data from localStorage or create empty arrays
    let orderItems = JSON.parse(localStorage.getItem('orderItems') || '[]');
    let paymentMethod = localStorage.getItem('paymentMethod') || '';
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const nextTabBtn = document.getElementById('next-tab');
    const prevTabBtn = document.getElementById('prev-tab');
    let currentTabIndex = 0;
    
    // Update UI based on stored data
    updateOrderSummary();
    updatePaymentDisplay();
    
    // Tab functionality
    function showTab(index) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        tabButtons[index].classList.add('active');
        tabContents[index].classList.add('active');
        currentTabIndex = index;
        
        // Update navigation buttons
        prevTabBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
        nextTabBtn.style.visibility = index === tabButtons.length - 1 ? 'hidden' : 'visible';
    }
    
    // Initialize with first tab
    showTab(0);
    
    // Tab button click handlers
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => showTab(index));
    });
    
    // Next/Previous tab navigation
    nextTabBtn.addEventListener('click', () => {
        if (currentTabIndex < tabButtons.length - 1) {
            showTab(currentTabIndex + 1);
        }
    });
    
    prevTabBtn.addEventListener('click', () => {
        if (currentTabIndex > 0) {
            showTab(currentTabIndex - 1);
        }
    });
    
    // Add item to order
    const addButtons = document.querySelectorAll('.add-item');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const id = menuItem.dataset.id;
            const name = menuItem.dataset.name;
            const price = menuItem.dataset.price;
            
            orderItems.push({ id, name, price });
            localStorage.setItem('orderItems', JSON.stringify(orderItems));
            
            updateOrderSummary();
            checkConfirmButton();
        });
    });
    
    // Payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        // Set checked state based on stored payment method
        if (option.value === paymentMethod) {
            option.checked = true;
        }
        
        option.addEventListener('change', function() {
            if (this.checked) {
                paymentMethod = this.value;
                localStorage.setItem('paymentMethod', paymentMethod);
                updatePaymentDisplay();
                checkConfirmButton();
            }
        });
    });
    
    // Confirm order button
    const confirmOrderBtn = document.getElementById('confirm-order');
    confirmOrderBtn.addEventListener('click', function() {
        if (orderItems.length > 0 && paymentMethod) {
            window.location.href = 'confirmation.html';
        }
    });
    
    // Update order summary display
    function updateOrderSummary() {
        const orderItemsContainer = document.getElementById('order-items');
        const totalPriceElement = document.getElementById('total-price');
        
        // Clear current items
        orderItemsContainer.innerHTML = '';
        
        if (orderItems.length === 0) {
            orderItemsContainer.innerHTML = '<p class="empty-order">Belum Ada Pesanan</p>';
            totalPriceElement.textContent = 'Rp 0';
            return;
        }
        
        // Calculate total price
        let totalPrice = 0;
        
        // Add each item to the display
        orderItems.forEach((item, index) => {
            const price = parseInt(item.price);
            totalPrice += price;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="order-item-details">
                    <div>${item.name}</div>
                    <div>Rp ${price.toLocaleString()}</div>
                </div>
                <button class="remove-item" data-index="${index}">×</button>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
        
        // Update total price
        totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString()}`;
        
        // Add event listeners to remove buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                orderItems.splice(index, 1);
                localStorage.setItem('orderItems', JSON.stringify(orderItems));
                updateOrderSummary();
                checkConfirmButton();
            });
        });
    }
    
    // Update payment method display
    function updatePaymentDisplay() {
        const paymentDisplay = document.getElementById('selected-payment');
        paymentDisplay.textContent = paymentMethod || 'Belum Memilih Pembayaran';
    }
    
    // Check if confirm button should be enabled
    function checkConfirmButton() {
        const confirmBtn = document.getElementById('confirm-order');
        confirmBtn.disabled = !(orderItems.length > 0 && paymentMethod);
    }
});