document.addEventListener("DOMContentLoaded", () => {
  // Get order data from localStorage
  const orderItems = JSON.parse(localStorage.getItem("orderItems") || "[]")
  const paymentMethod = localStorage.getItem("paymentMethod") || ""
  const discountAmount = Number.parseInt(localStorage.getItem("discountAmount") || "0")
  const orderTime = localStorage.getItem("orderTime") || new Date().toISOString()

  // If no order data, redirect to order page
  if (orderItems.length === 0) {
    window.location.href = "order.html"
    return
  }

  // Calculate subtotal and total price
  const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
  const totalPrice = subtotal - discountAmount

  // Display order items
  const itemsContainer = document.getElementById("confirmation-items")
  orderItems.forEach((item) => {
    const itemElement = document.createElement("div")
    itemElement.className = "confirmation-item"
    itemElement.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">x${item.quantity}</span>
            </div>
            <span class="item-price">Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</span>
        `
    itemsContainer.appendChild(itemElement)
  })

  // Display subtotal, discount, and total price
  document.getElementById("confirmation-subtotal").textContent = `Rp ${formatPrice(subtotal)}`

  if (discountAmount > 0) {
    document.getElementById("confirmation-discount-row").style.display = "flex"
    document.getElementById("confirmation-discount").textContent = `-Rp ${formatPrice(discountAmount)}`
  }

  document.getElementById("confirmation-total").textContent = `Rp ${formatPrice(totalPrice)}`

  // Display payment method and time
  document.getElementById("confirmation-payment-method").textContent = paymentMethod
  document.getElementById("confirmation-time").textContent = new Date(orderTime).toLocaleString("id-ID")

  // Save order to history
  saveOrderToHistory(orderItems, paymentMethod, discountAmount, orderTime)

  // Print receipt functionality
  document.getElementById("print-receipt").addEventListener("click", () => {
    printReceipt(orderItems, paymentMethod, subtotal, discountAmount, totalPrice, orderTime)
  })

  // Clear order data when returning to home
  document.getElementById("back-home").addEventListener("click", () => {
    localStorage.removeItem("orderItems")
    localStorage.removeItem("paymentMethod")
    localStorage.removeItem("discountAmount")
    localStorage.removeItem("orderTime")
  })

  // Show order history modal
  setupHistoryModal()
})

function saveOrderToHistory(items, paymentMethod, discountAmount, timestamp) {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

  // Add current order to history
  orderHistory.push({
    items,
    paymentMethod,
    discountAmount,
    timestamp,
  })

  // Keep only the last 10 orders
  if (orderHistory.length > 10) {
    orderHistory.shift()
  }

  localStorage.setItem("orderHistory", JSON.stringify(orderHistory))
}

function printReceipt(items, paymentMethod, subtotal, discountAmount, totalPrice, orderTime) {
  // Populate print template
  document.getElementById("print-date").textContent = new Date(orderTime).toLocaleString("id-ID")

  const printItems = document.getElementById("print-items")
  printItems.innerHTML = ""

  items.forEach((item) => {
    const itemRow = document.createElement("div")
    itemRow.className = "print-item"
    itemRow.innerHTML = `
            <div class="print-item-name">${item.name} x${item.quantity}</div>
            <div class="print-item-price">Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</div>
        `
    printItems.appendChild(itemRow)
  })

  document.getElementById("print-subtotal").textContent = `Rp ${formatPrice(subtotal)}`

  if (discountAmount > 0) {
    document.getElementById("print-discount-row").style.display = "flex"
    document.getElementById("print-discount").textContent = `-Rp ${formatPrice(discountAmount)}`
  } else {
    document.getElementById("print-discount-row").style.display = "none"
  }

  document.getElementById("print-total").textContent = `Rp ${formatPrice(totalPrice)}`
  document.getElementById("print-payment-method").textContent = paymentMethod

  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  printWindow.document.write("<html><head><title>Struk Pemesanan - Kantin Digital</title>")
  printWindow.document.write("<style>")
  printWindow.document.write(`
        body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
        .print-receipt { max-width: 300px; margin: 0 auto; }
        h1, h2 { text-align: center; margin: 5px 0; }
        h1 { font-size: 18px; }
        h2 { font-size: 16px; }
        hr { border: 1px dashed #000; margin: 10px 0; }
        .print-date { text-align: center; font-size: 12px; margin-bottom: 10px; }
        .print-item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
        .print-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
        .print-total { font-weight: bold; font-size: 16px; }
        .print-payment { margin: 10px 0; font-size: 14px; }
        .print-thank-you { text-align: center; font-size: 14px; margin-top: 20px; }
        @media print {
            @page { margin: 0; }
            body { margin: 10mm; }
        }
    `)
  printWindow.document.write("</style></head><body>")
  printWindow.document.write(document.getElementById("print-template").innerHTML)
  printWindow.document.write("</body></html>")
  printWindow.document.close()

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

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

          // Show toast and redirect
          showToast("Pesanan ditambahkan ke keranjang!")
          setTimeout(() => {
            window.location.href = "order.html"
          }, 1000)
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

// Format price with thousand separators
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}
