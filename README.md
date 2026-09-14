# ज्वेलर्स सूर्य कुमार एण्ड संस - 32" Android TV Jewellery Rate Display Board

An exact, digital replica of the electronic jewellery rate display board designed specifically for a **32-inch Android TV** (16:9 widescreen landscape).

Works **100% Offline** with **Custom Rate Controls** via the TV Remote.

---

## 📺 How to Run on 32" Android TV (100% Offline)

### Option 1: Via USB Pen Drive (Easiest & Quickest)
1. Copy the entire folder `jewellery-rate-display` to a USB Pen Drive.
2. Plug the USB Drive into your Android TV.
3. Install or open any web browser on your Android TV from Google Play Store (Recommended: **TV Bro** or **JioPages**).
4. In the browser, open the file:
   `file:///storage/.../jewellery-rate-display/index.html`
5. Press the **Fullscreen** button in the browser (or F11).
6. Done! The display board will run 24/7 completely offline.

### Option 2: Run on Local Wi-Fi (No Internet Needed)
1. On your PC or laptop in the shop, open terminal in this folder and run:
   ```bash
   python -m http.server 8080
   ```
2. Find your PC's local IP address (e.g. `192.168.1.15`).
3. On your Android TV browser, open:
   `http://192.168.1.15:8080`
4. The service worker caches everything locally on the TV. Even if you turn off the PC, the TV browser keeps running offline!

---

## 🎮 How to Update Rates Using Your TV Remote

1. Press the **[ OK / Center Button ]** or **[ Menu ]** key on your TV Remote (or click the discreet ⚙️ icon in the top-right corner).
2. The **Update Jewellery Rates** window will open.
3. Use the **D-Pad Arrow Keys (▲ ▼ ◄ ►)** on your TV remote to navigate between:
   - 24K Gold (Sale & Purchase)
   - 22K Gold (Sale & Purchase)
   - 20K Gold (Sale & Purchase)
   - 18K Gold (Sale & Purchase)
   - Silver (Sale & Purchase)
4. Type or adjust your custom prices.
5. Navigate down to **💾 SAVE & APPLY [OK]** and press the **OK** button.
6. The rates update immediately on the board and are **permanently saved** in the TV's memory (`localStorage`).

> 💡 **Power Cut / Reboot Safe**: Even if the power cuts or the TV restarts, your custom rates are loaded automatically when reopened!

---

## ✨ Features Included

* **Identical Shop Name**: 3D embossed golden Hindi typography for **"ज्वेलर्स सूर्य कुमार एण्ड संस"**.
* **Authentic SKS Crest Logo**: Custom vector diamond crest with stars and SKS monogram.
* **Official BIS Hallmark Logo**: Authentic blue triangle with red dot, *"मानक: पथप्रदर्शक:"*, and *"Certified Hallmark Jewellery From BIS"* banner.
* **GSTIN Section Removed**: Cleaned up as requested.
* **Real-Time LED Clock & Date**: Live ticking `TIME` (`HH.MM.SS`) and `DATE` (`DD.MM.YY`).
* **5-Tier Rate Table**: 24K, 22K, 20K, 18K Gold & Silver with both **SALE** and **PURCHASE** 6-digit glowing red LED segments (`000000.`).
* **Footer**: Golden bordered `GST & MAKING CHARGE EXTRA`.
* **Screen Keep-Awake**: Uses the Web Screen Wake Lock API to prevent the TV from going to sleep during business hours.
* **Burn-In Protection**: Subtle 1px micro-shift every 20 minutes to prevent image retention on TV panels.
