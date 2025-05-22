// Stock management functions
const stockManager = {
  // Get stock data
  getStockData: () => JSON.parse(localStorage.getItem("stockData") || "{}"),

  // Check if item is in stock
  checkStock: function (category, id, quantity) {
    const stockData = this.getStockData()

    // If stock data doesn't exist yet, return true (assume in stock)
    if (!stockData[category]) return true

    const item = stockData[category].find((item) => item.id === id)

    // If item not found in stock data, return true (assume in stock)
    if (!item) return true

    // Check if requested quantity is available
    return item.stock >= quantity
  },

  // Update stock when item is ordered
  updateStock: function (category, id, quantity) {
    const stockData = this.getStockData()

    // If stock data doesn't exist yet, do nothing
    if (!stockData[category]) return

    const item = stockData[category].find((item) => item.id === id)

    // If item not found in stock data, do nothing
    if (!item) return

    // Reduce stock by ordered quantity
    item.stock -= quantity

    // Ensure stock doesn't go below 0
    if (item.stock < 0) item.stock = 0

    // Save updated stock data
    localStorage.setItem("stockData", JSON.stringify(stockData))
  },
}

// Export for use in other scripts
window.stockManager = stockManager
