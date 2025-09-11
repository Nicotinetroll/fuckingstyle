// frontend/src/config.ts
// 🚀 EASY CONFIG - CHANGE VALUES HERE 🚀

export const CONFIG = {
  // Token Contract Address
  TOKEN_CA: "6cwNtPG77jBYZRzUSwWUS8j7QcYtG3MRJ6akx3bmpump", // Change this to your token CA
  
  // Token Symbol
  TOKEN_SYMBOL: "$FUKD",
  
  // Telegram Group Link
  TELEGRAM_LINK: "https://t.me/wegotfuckingrekt",
  
  // Chart Link (DexScreener, DexTools, Birdeye, etc.)
  CHART_LINK: "https://pump.fun/coin/6cwNtPG77jBYZRzUSwWUS8j7QcYtG3MRJ6akx3bmpumpß",
  
  // Other Social Links (optional)
  TWITTER_LINK: "", // Optional
  DISCORD_LINK: "", // Optional
  WEBSITE_LINK: "", // Optional
  
  // Backend Settings - empty string means use same domain
  BACKEND_URL: "",
  
  // Display Settings
  SHOW_CHART_BUTTON: true,
  SHOW_TWITTER_BUTTON: false, // Set to true to show Twitter button
  SHOW_DISCORD_BUTTON: false, // Set to true to show Discord button
  
  // Rewards Settings
  MIN_HOLD_AMOUNT: 50, // Minimum $ worth of tokens to qualify
  TOTAL_VOTES_PER_USER: 10, // How many votes each user gets
  
  // Dev Wallet Info
  DEV_WALLET_PERCENTAGE: 20, // Percentage of supply for dev
  
  // Milestones for rewards
  MILESTONES: [
    { mc: '50K MC', reward: '10% Dev Wallet', winners: 3 },
    { mc: '100K MC', reward: '15% Dev Wallet', winners: 3 },
    { mc: '250K MC', reward: '20% Dev Wallet', winners: 3 },
    { mc: '500K MC', reward: '30% Dev Wallet', winners: 3 }
  ]
}

// DO NOT EDIT BELOW THIS LINE
export default CONFIG