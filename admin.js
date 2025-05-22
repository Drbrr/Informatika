// Admin functionality for Kantin Digital

function getStock() {
  // Placeholder for getStock function
  return JSON.parse(localStorage.getItem("menuStock") || '{"food": {}, "drink": {}}')
}

function showToast(message) {
  // Placeholder for showToast function
  alert(message)
}

function resetStock() {
  // Placeholder for resetStock function
  const stock = getStock()
  for (const category in stock) {
    for (const id in stock[category]) {
      stock[category][id].stock = stock[category][id].initialStock
    }
  }
  localStorage.setItem("menuStock", JSON.stringify(stock))
  location.reload()
}

function formatPrice(price) {
  // Placeholder for formatPrice function
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

document.addEventListener("DOMContentLoaded", () => {
  // Load stock data
  const stock = getStock()

  // Populate food stock table
  const foodStockTable = document.getElementById("food-stock-table").querySelector("tbody")
  for (const id in stock.food) {
    const item = stock.food[id]
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.initialStock}</td>
      <td>
        <input type="number" class="stock-input" 
               data-id="${id}" 
               data-category="food" 
               value="${item.stock}" 
               min="0" max="${item.initialStock}">
      </td>
      <td class="stock-actions">
        <button class="btn btn-sm btn-outline set-max" data-id="${id}" data-category="food">
          Max
        </button>
        <button class="btn btn-sm btn-outline set-zero" data-id="${id}" data-category="food">
          Habis
        </button>
      </td>
    `
    foodStockTable.appendChild(row)
  }

  // Populate drink stock table
  const drinkStockTable = document.getElementById("drink-stock-table").querySelector("tbody")
  for (const id in stock.drink) {
    const item = stock.drink[id]
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.initialStock}</td>
      <td>
        <input type="number" class="stock-input" 
               data-id="${id}" 
               data-category="drink" 
               value="${item.stock}" 
               min="0" max="${item.initialStock}">
      </td>
      <td class="stock-actions">
        <button class="btn btn-sm btn-outline set-max" data-id="${id}" data-category="drink">
          Max
        </button>
        <button class="btn btn-sm btn-outline set-zero" data-id="${id}" data-category="drink">
          Habis
        </button>
      </td>
    `
    drinkStockTable.appendChild(row)
  }

  // Set max stock button event
  document.querySelectorAll(".set-max").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id
      const category = this.dataset.category
      const input = document.querySelector(`.stock-input[data-id="${id}"][data-category="${category}"]`)
      const maxValue = stock[category][id].initialStock
      input.value = maxValue
    })
  })

  // Set zero stock button event
  document.querySelectorAll(".set-zero").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id
      const category = this.dataset.category
      const input = document.querySelector(`.stock-input[data-id="${id}"][data-category="${category}"]`)
      input.value = 0
    })
  })

  // Save stock changes
  document.getElementById("save-stock").addEventListener("click", () => {
    const inputs = document.querySelectorAll(".stock-input")
    const updatedStock = JSON.parse(JSON.stringify(stock)) // Deep copy

    inputs.forEach((input) => {
      const id = input.dataset.id
      const category = input.dataset.category
      const value = Number.parseInt(input.value)

      if (!isNaN(value) && value >= 0) {
        updatedStock[category][id].stock = value
      }
    })

    localStorage.setItem("menuStock", JSON.stringify(updatedStock))
    showToast("Perubahan stok berhasil disimpan!")
  })

  // Reset stock button
  document.getElementById("reset-stock").addEventListener("click", resetStock)

  // Generate sales report
  generateSalesReport()

  // Export report button
  document.getElementById("export-report").addEventListener("click", exportSalesReport)
})

// Generate sales report from order history
function generateSalesReport() {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")
  const totalOrders = orderHistory.length
  let totalRevenue = 0

  // Item sales tracking
  const itemSales = {}

  // Process each order
  orderHistory.forEach((order) => {
    const subtotal = order.items.reduce((sum, item) => sum + Number.parseInt(item.price) * item.quantity, 0)
    const total = subtotal - (order.discountAmount || 0)
    totalRevenue += total

    // Track item sales
    order.items.forEach((item) => {
      const key = `${item.category}-${item.id}`
      if (!itemSales[key]) {
        itemSales[key] = {
          name: item.name,
          category: item.category,
          quantity: 0,
          revenue: 0,
        }
      }

      itemSales[key].quantity += item.quantity
      itemSales[key].revenue += Number.parseInt(item.price) * item.quantity
    })
  })

  // Update UI
  document.getElementById("total-orders").textContent = totalOrders
  document.getElementById("total-revenue").textContent = `Rp ${formatPrice(totalRevenue)}`

  // Sort items by quantity sold (descending)
  const sortedItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity)

  // Populate popular items table
  const popularItemsTable = document.getElementById("popular-items-table").querySelector("tbody")
  popularItemsTable.innerHTML = ""

  if (sortedItems.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="4" class="text-center">Belum ada data penjualan</td>`
    popularItemsTable.appendChild(row)
  } else {
    sortedItems.forEach((item) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.category === "food" ? "Makanan" : "Minuman"}</td>
        <td>${item.quantity}</td>
        <td>Rp ${formatPrice(item.revenue)}</td>
      `
      popularItemsTable.appendChild(row)
    })
  }
}

// Export sales report as CSV
function exportSalesReport() {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

  if (orderHistory.length === 0) {
    showToast("Tidak ada data untuk diekspor")
    return
  }

  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,"
  csvContent += "Tanggal,Item,Kategori,Jumlah,Harga Satuan,Total\n"

  orderHistory.forEach((order) => {
    const orderDate = new Date(order.timestamp).toLocaleString("id-ID")

    order.items.forEach((item) => {
      const row = [
        orderDate,
        item.name,
        item.category === "food" ? "Makanan" : "Minuman",
        item.quantity,
        `Rp ${formatPrice(item.price)}`,
        `Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}`,
      ]

      csvContent += row.join(",") + "\n"
    })
  })

  // Create download link
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)

  // Trigger download
  link.click()
  document.body.removeChild(link)

  showToast("Laporan berhasil diekspor")
}
