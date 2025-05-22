document.addEventListener("DOMContentLoaded", () => {
  // Admin credentials
  const ADMIN_USERNAME = "admin"
  const ADMIN_PASSWORD = "admin123"

  // DOM elements
  const loginContainer = document.getElementById("login-container")
  const adminContainer = document.getElementById("admin-container")
  const loginBtn = document.getElementById("login-btn")
  const logoutBtn = document.getElementById("logout-btn")
  const loginError = document.getElementById("login-error")
  const adminTabs = document.querySelectorAll(".admin-tab")
  const adminTabContents = document.querySelectorAll(".admin-tab-content")
  const foodStockTable = document.getElementById("food-stock-table").querySelector("tbody")
  const drinkStockTable = document.getElementById("drink-stock-table").querySelector("tbody")
  const adminOrderHistory = document.getElementById("admin-order-history")

  // Check if user is logged in
  function checkLogin() {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
    loginContainer.style.display = isLoggedIn ? "none" : "block"
    adminContainer.style.display = isLoggedIn ? "block" : "none"

    if (isLoggedIn) {
      loadStockData()
      loadOrderHistory()
    }
  }

  // Initialize stock data if not exists
  function initializeStockData() {
    if (!localStorage.getItem("stockData")) {
      const stockData = {
        food: [
          { id: "1", name: "Nasi Goreng", price: 15000, stock: 20 },
          { id: "2", name: "Mie Goreng", price: 12000, stock: 15 },
          { id: "3", name: "Ayam Geprek", price: 10000, stock: 25 },
          { id: "4", name: "Sate Ayam", price: 20000, stock: 30 },
          { id: "5", name: "Sate Sapi", price: 22000, stock: 20 },
        ],
        drink: [
          { id: "1", name: "Es Teh", price: 5000, stock: 50 },
          { id: "2", name: "Es Jeruk", price: 6000, stock: 40 },
          { id: "3", name: "Susu Coklat", price: 8000, stock: 30 },
          { id: "4", name: "Susu Vanilla", price: 8000, stock: 25 },
          { id: "5", name: "Air Mineral", price: 4000, stock: 100 },
        ],
      }
      localStorage.setItem("stockData", JSON.stringify(stockData))
    }
  }

  // Load stock data to tables
  function loadStockData() {
    const stockData = JSON.parse(localStorage.getItem("stockData"))

    // Clear tables
    foodStockTable.innerHTML = ""
    drinkStockTable.innerHTML = ""

    // Populate food stock table
    stockData.food.forEach((item) => {
      const row = document.createElement("tr")
      if (item.stock === 0) {
        row.classList.add("out-of-stock")
      }

      row.innerHTML = `
                <td>${item.name}</td>
                <td>Rp ${formatPrice(item.price)}</td>
                <td class="${item.stock < 5 ? "low-stock" : ""}">${item.stock}</td>
                <td class="stock-actions">
                    <input type="number" class="stock-input" min="1" value="5">
                    <button class="btn btn-sm btn-outline restock-btn" data-category="food" data-id="${item.id}">
                        <i class="fas fa-plus"></i> Restock
                    </button>
                </td>
            `
      foodStockTable.appendChild(row)
    })

    // Populate drink stock table
    stockData.drink.forEach((item) => {
      const row = document.createElement("tr")
      if (item.stock === 0) {
        row.classList.add("out-of-stock")
      }

      row.innerHTML = `
                <td>${item.name}</td>
                <td>Rp ${formatPrice(item.price)}</td>
                <td class="${item.stock < 10 ? "low-stock" : ""}">${item.stock}</td>
                <td class="stock-actions">
                    <input type="number" class="stock-input" min="1" value="10">
                    <button class="btn btn-sm btn-outline restock-btn" data-category="drink" data-id="${item.id}">
                        <i class="fas fa-plus"></i> Restock
                    </button>
                </td>
            `
      drinkStockTable.appendChild(row)
    })

    // Add event listeners to restock buttons
    document.querySelectorAll(".restock-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const category = this.dataset.category
        const id = this.dataset.id
        const quantityInput = this.parentElement.querySelector(".stock-input")
        const quantity = Number.parseInt(quantityInput.value)

        if (quantity > 0) {
          restockItem(category, id, quantity)
          showToast(`Berhasil menambah stok ${quantity} item`)
          loadStockData() // Reload stock data
        }
      })
    })
  }

  // Restock an item
  function restockItem(category, id, quantity) {
    const stockData = JSON.parse(localStorage.getItem("stockData"))
    const item = stockData[category].find((item) => item.id === id)

    if (item) {
      item.stock += quantity
      localStorage.setItem("stockData", JSON.stringify(stockData))
    }
  }

  // Load order history
  function loadOrderHistory() {
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

    if (orderHistory.length === 0) {
      adminOrderHistory.innerHTML = '<p class="text-center">Belum ada riwayat pesanan.</p>'
      return
    }

    adminOrderHistory.innerHTML = ""

    // Display order history in reverse chronological order
    orderHistory.reverse().forEach((order, index) => {
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
                    <h4>Pesanan #${index + 1}</h4>
                    <span>${orderDate}</span>
                </div>
                <div class="history-item-content">
                    ${itemsHtml}
                </div>
                <div class="history-item-footer">
                    <span>Total: Rp ${formatPrice(totalPrice)}</span>
                    <span>Pembayaran: ${order.paymentMethod}</span>
                </div>
            `

      adminOrderHistory.appendChild(orderElement)
    })
  }

  // Format price with thousand separators
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Show toast notification
  function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast")
    toast.textContent = message
    toast.classList.add("show")

    setTimeout(() => {
      toast.classList.remove("show")
    }, duration)
  }

  // Event listeners
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true")
      loginError.style.display = "none"
      checkLogin()
    } else {
      loginError.style.display = "block"
    }
  })

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn")
    checkLogin()
  })

  // Tab switching
  adminTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.dataset.tab

      // Remove active class from all tabs and contents
      adminTabs.forEach((t) => t.classList.remove("active"))
      adminTabContents.forEach((c) => c.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      this.classList.add("active")
      document.getElementById(`${tabId}-tab`).classList.add("active")
    })
  })

  // About Us Modal
  const aboutModal = document.getElementById("about-modal")
  const closeAboutBtn = document.querySelector(".close-about")

  window.showAboutModal = () => {
    aboutModal.style.display = "block"
  }

  closeAboutBtn.addEventListener("click", () => {
    aboutModal.style.display = "none"
  })

  window.addEventListener("click", (event) => {
    if (event.target === aboutModal) {
      aboutModal.style.display = "none"
    }
  })

  // Initialize
  initializeStockData()
  checkLogin()
})
