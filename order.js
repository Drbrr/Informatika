document.addEventListener("DOMContentLoaded", () => {
  // Initialize order data from localStorage or create empty arrays
  let orderItems = JSON.parse(localStorage.getItem("orderItems") || "[]")
  let paymentMethod = localStorage.getItem("paymentMethod") || ""
  let discountAmount = Number.parseInt(localStorage.getItem("discountAmount") || "0")

  // Declare showToast and formatPrice functions
  function showToast(message) {
    // Implementation of showToast function
    console.log(message) // Placeholder implementation
  }

  function formatPrice(price) {
    // Implementation of formatPrice function
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") // Placeholder implementation
  }

  // Check URL parameters for initial tab
  const urlParams = new URLSearchParams(window.location.search)
  const initialTab = urlParams.get("tab")

  // Tab navigation
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const nextTabBtn = document.getElementById("next-tab")
  const prevTabBtn = document.getElementById("prev-tab")
  let currentTabIndex = 0

  // Update UI based on stored data
  updateOrderSummary()
  updatePaymentDisplay()
  updateCartCount()

  // Tab functionality
  function showTab(index) {
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    tabButtons[index].classList.add("active")
    tabContents[index].classList.add("active")
    currentTabIndex = index

    // Update navigation buttons
    prevTabBtn.style.visibility = index === 0 ? "hidden" : "visible"
    nextTabBtn.style.visibility = index === tabButtons.length - 1 ? "hidden" : "visible"
  }

  // Initialize with first tab or specified tab from URL
  if (initialTab === "drink") {
    showTab(1) // Show drinks tab (index 1)
  } else if (initialTab === "payment") {
    showTab(2) // Show payment tab (index 2)
  } else {
    showTab(0) // Default to food tab (index 0)
  }

  // Tab button click handlers - FIX TAB NAVIGATION
  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      showTab(index)
    })
  })

  // Next/Previous tab navigation
  nextTabBtn.addEventListener("click", () => {
    if (currentTabIndex < tabButtons.length - 1) {
      showTab(currentTabIndex + 1)
    }
  })

  prevTabBtn.addEventListener("click", () => {
    if (currentTabIndex > 0) {
      showTab(currentTabIndex - 1)
    }
  })

  // Quantity control
  const quantityBtns = document.querySelectorAll(".quantity-btn")
  quantityBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.parentElement.querySelector(".quantity-input")
      let value = Number.parseInt(input.value)

      if (this.classList.contains("plus")) {
        value = Math.min(value + 1, 10)
      } else if (this.classList.contains("minus")) {
        value = Math.max(value - 1, 1)
      }

      input.value = value
    })
  })

  // Add item to order - FIX ADD TO CART FUNCTIONALITY
  const addButtons = document.querySelectorAll(".add-item")
  addButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const menuItem = this.closest(".menu-item")
      const id = menuItem.dataset.id
      const name = menuItem.dataset.name
      const price = menuItem.dataset.price
      const category = menuItem.dataset.category
      const quantityInput = menuItem.querySelector(".quantity-input")
      const quantity = Number.parseInt(quantityInput.value)

      // Check if item already exists in order
      const existingItemIndex = orderItems.findIndex((item) => item.id === id && item.category === category)

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        orderItems[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        orderItems.push({ id, name, price, category, quantity })
      }

      localStorage.setItem("orderItems", JSON.stringify(orderItems))

      // Reset quantity input
      quantityInput.value = 1

      // Show toast notification
      showToast(`${name} ditambahkan ke pesanan!`)

      updateOrderSummary()
      updateCartCount()
      checkConfirmButton()
    })
  })

  // Payment method selection
  const paymentOptions = document.querySelectorAll('input[name="payment"]')
  paymentOptions.forEach((option) => {
    // Set checked state based on stored payment method
    if (option.value === paymentMethod) {
      option.checked = true
    }

    option.addEventListener("change", function () {
      if (this.checked) {
        paymentMethod = this.value
        localStorage.setItem("paymentMethod", paymentMethod)
        updatePaymentDisplay()
        checkConfirmButton()
        showToast(`Metode pembayaran diubah ke ${paymentMethod}`)
      }
    })
  })

  // Discount code
  const discountCodeInput = document.getElementById("discount-code")
  const applyDiscountBtn = document.getElementById("apply-discount")
  const discountMessage = document.getElementById("discount-message")

  applyDiscountBtn.addEventListener("click", () => {
    const code = discountCodeInput.value.trim().toUpperCase()

    if (code === "DISKON10") {
      // Calculate 10% discount
      const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
      discountAmount = Math.round(subtotal * 0.1)
      localStorage.setItem("discountAmount", discountAmount.toString())

      discountMessage.textContent = "Diskon 10% berhasil diterapkan!"
      discountMessage.style.color = "green"

      showToast("Kode promo berhasil diterapkan!")

      updateOrderSummary()
    } else if (code === "DISKON20") {
      // Calculate 20% discount
      const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
      discountAmount = Math.round(subtotal * 0.2)
      localStorage.setItem("discountAmount", discountAmount.toString())

      discountMessage.textContent = "Diskon 20% berhasil diterapkan!"
      discountMessage.style.color = "green"

      showToast("Kode promo berhasil diterapkan!")

      updateOrderSummary()
    } else {
      discountMessage.textContent = "Kode promo tidak valid."
      discountMessage.style.color = "red"
    }
  })

  // Confirm order button
  const confirmOrderBtn = document.getElementById("confirm-order")
  const confirmModal = document.getElementById("confirm-modal")
  const closeConfirmBtn = document.querySelector(".close-confirm")
  const cancelConfirmBtn = document.getElementById("cancel-confirm")
  const proceedConfirmBtn = document.getElementById("proceed-confirm")

  confirmOrderBtn.addEventListener("click", () => {
    if (orderItems.length > 0 && paymentMethod) {
      confirmModal.style.display = "block"
    } else {
      if (orderItems.length === 0) {
        showToast("Silakan pilih menu terlebih dahulu!")
      } else if (!paymentMethod) {
        showToast("Silakan pilih metode pembayaran!")
        showTab(2) // Show payment tab
      }
    }
  })

  closeConfirmBtn.addEventListener("click", () => {
    confirmModal.style.display = "none"
  })

  cancelConfirmBtn.addEventListener("click", () => {
    confirmModal.style.display = "none"
  })

  proceedConfirmBtn.addEventListener("click", () => {
    // Save order time
    localStorage.setItem("orderTime", new Date().toISOString())

    // Redirect to confirmation page
    window.location.href = "confirmation.html"
  })

  // Clear cart button
  const clearCartBtn = document.getElementById("clear-cart")
  const clearCartModal = document.getElementById("clear-cart-modal")
  const closeClearCartBtn = document.querySelector(".close-clear-cart")
  const cancelClearBtn = document.getElementById("cancel-clear")
  const proceedClearBtn = document.getElementById("proceed-clear")

  clearCartBtn.addEventListener("click", () => {
    if (orderItems.length > 0) {
      clearCartModal.style.display = "block"
    }
  })

  closeClearCartBtn.addEventListener("click", () => {
    clearCartModal.style.display = "none"
  })

  cancelClearBtn.addEventListener("click", () => {
    clearCartModal.style.display = "none"
  })

  proceedClearBtn.addEventListener("click", () => {
    orderItems = []
    localStorage.setItem("orderItems", JSON.stringify(orderItems))

    discountAmount = 0
    localStorage.setItem("discountAmount", "0")

    updateOrderSummary()
    updateCartCount()
    checkConfirmButton()

    clearCartModal.style.display = "none"
    showToast("Keranjang berhasil dikosongkan!")
  })

  // Search functionality
  const searchInput = document.getElementById("search-input")
  const clearSearchBtn = document.getElementById("clear-search")

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim()

    if (searchTerm) {
      clearSearchBtn.style.display = "block"
    } else {
      clearSearchBtn.style.display = "none"
    }

    // Filter food items
    const foodItems = document.querySelectorAll("#food-items .menu-item")
    foodItems.forEach((item) => {
      const name = item.dataset.name.toLowerCase()
      if (name.includes(searchTerm)) {
        item.style.display = "grid"
      } else {
        item.style.display = "none"
      }
    })

    // Filter drink items
    const drinkItems = document.querySelectorAll("#drink-items .menu-item")
    drinkItems.forEach((item) => {
      const name = item.dataset.name.toLowerCase()
      if (name.includes(searchTerm)) {
        item.style.display = "grid"
      } else {
        item.style.display = "none"
      }
    })
  })

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = ""
    clearSearchBtn.style.display = "none"

    // Show all items
    const allItems = document.querySelectorAll(".menu-item")
    allItems.forEach((item) => {
      item.style.display = "grid"
    })
  })

  // Mobile cart button
  const mobileCartBtn = document.getElementById("mobile-cart-btn")
  const orderSummary = document.getElementById("order-summary")

  mobileCartBtn.addEventListener("click", () => {
    orderSummary.classList.toggle("show-mobile")
  })

  // History modal
  setupHistoryModal()

  // Update order summary display
  function updateOrderSummary() {
    const orderItemsContainer = document.getElementById("order-items")
    const subtotalElement = document.getElementById("subtotal")
    const discountRow = document.getElementById("discount-row")
    const discountAmountElement = document.getElementById("discount-amount")
    const totalPriceElement = document.getElementById("total-price")

    // Clear current items
    orderItemsContainer.innerHTML = ""

    if (orderItems.length === 0) {
      orderItemsContainer.innerHTML = '<p class="empty-order">Belum Ada Pesanan</p>'
      subtotalElement.textContent = "Rp 0"
      totalPriceElement.textContent = "Rp 0"
      discountRow.style.display = "none"
      return
    }

    // Calculate subtotal
    let subtotal = 0

    // Add each item to the display
    orderItems.forEach((item, index) => {
      const price = Number.parseInt(item.price)
      const itemTotal = price * item.quantity
      subtotal += itemTotal

      const itemElement = document.createElement("div")
      itemElement.className = "order-item"
      itemElement.innerHTML = `
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-price">Rp ${formatPrice(price)} x ${item.quantity}</div>
                </div>
                <div class="order-item-total">Rp ${formatPrice(itemTotal)}</div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `
      orderItemsContainer.appendChild(itemElement)
    })

    // Update subtotal
    subtotalElement.textContent = `Rp ${formatPrice(subtotal)}`

    // Update discount if applicable
    if (discountAmount > 0) {
      discountRow.style.display = "flex"
      discountAmountElement.textContent = `-Rp ${formatPrice(discountAmount)}`
    } else {
      discountRow.style.display = "none"
    }

    // Calculate and update total price
    const totalPrice = subtotal - discountAmount
    totalPriceElement.textContent = `Rp ${formatPrice(totalPrice)}`

    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll(".remove-item")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = Number.parseInt(this.dataset.index)
        const removedItem = orderItems[index]

        orderItems.splice(index, 1)
        localStorage.setItem("orderItems", JSON.stringify(orderItems))

        showToast(`${removedItem.name} dihapus dari pesanan!`)

        updateOrderSummary()
        updateCartCount()
        checkConfirmButton()
      })
    })
  }

  // Update payment method display
  function updatePaymentDisplay() {
    const paymentDisplay = document.getElementById("selected-payment")
    paymentDisplay.textContent = paymentMethod || "Belum Memilih"
  }

  // Update cart count
  function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    const mobileCartCount = document.getElementById("mobile-cart-count")
    const totalItems = orderItems.reduce((total, item) => total + item.quantity, 0)

    cartCount.textContent = totalItems
    mobileCartCount.textContent = totalItems

    if (totalItems > 0) {
      mobileCartBtn.style.display = "flex"
    } else {
      mobileCartBtn.style.display = "none"
    }
  }

  // Check if confirm button should be enabled
  function checkConfirmButton() {
    const confirmBtn = document.getElementById("confirm-order")
    confirmBtn.disabled = !(orderItems.length > 0 && paymentMethod)
  }

  // Setup history modal
  function setupHistoryModal() {
    const historyModal = document.getElementById("history-modal")
    const showHistoryBtn = document.getElementById("show-history")
    const closeBtn = document.querySelector(".close")
    const historyList = document.getElementById("history-list")

    function showHistory() {
      // Get order history from localStorage
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

      // Clear previous content
      historyList.innerHTML = ""

      if (orderHistory.length === 0) {
        historyList.innerHTML = '<p class="text-center">Belum ada riwayat pesanan.</p>'
      } else {
        // Display order history
        orderHistory.forEach((order, index) => {
          const orderDate = new Date(order.timestamp).toLocaleString("id-ID")
          const subtotal = order.items.reduce((sum, item) => sum + Number.parseInt(item.price) * item.quantity, 0)
          const totalPrice = subtotal - (order.discountAmount || 0)

          const orderElement = document.createElement("div")
          orderElement.className = "history-item"

          let itemsHtml = ""
          order.items.forEach((item) => {
            itemsHtml += `
                            <div class="history-item-detail">
                                <span>${item.name} x${item.quantity}</span>
                                <span>Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</span>
                            </div>
                        `
          })

          orderElement.innerHTML = `
                        <div class="history-item-header">
                            <h4>Pesanan #${orderHistory.length - index}</h4>
                            <span>${orderDate}</span>
                        </div>
                        <div class="history-item-content">
                            ${itemsHtml}
                        </div>
                        <div class="history-item-footer">
                            <span>Total: Rp ${formatPrice(totalPrice)}</span>
                            <span>Pembayaran: ${order.paymentMethod}</span>
                        </div>
                        <button class="btn btn-sm btn-outline reorder-btn" data-index="${index}">
                            <i class="fas fa-redo"></i> Pesan Lagi
                        </button>
                    `

          historyList.appendChild(orderElement)
        })

        // Add event listeners to reorder buttons
        document.querySelectorAll(".reorder-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            const index = Number.parseInt(this.dataset.index)
            const order = orderHistory[index]

            // Set current order to this past order
            localStorage.setItem("orderItems", JSON.stringify(order.items))
            localStorage.setItem("paymentMethod", order.paymentMethod)

            // Show toast and update UI
            showToast("Pesanan ditambahkan ke keranjang!")
            updateOrderSummary()
            updateCartCount()
            checkConfirmButton()

            // Close modal
            historyModal.style.display = "none"
          })
        })
      }

      historyModal.style.display = "block"
    }

    showHistoryBtn.addEventListener("click", showHistory)

    closeBtn.addEventListener("click", () => {
      historyModal.style.display = "none"
    })

    window.addEventListener("click", (event) => {
      if (event.target === historyModal) {
        historyModal.style.display = "none"
      }
    })
  }
})
