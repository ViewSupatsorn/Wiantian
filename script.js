document.addEventListener("DOMContentLoaded", () => {
  // ✅ เพิ่มระบบคลิกพื้นที่ว่างนอก Modal Content เพื่อปิดหน้าต่าง
  const candleModal = document.getElementById("candleModal");
  candleModal?.addEventListener("click", (e) => {
    // ถ้าจุดที่คลิกคือตัว candle-modal เอง (ไม่ใช่ modal-content ด้านใน) ให้ปิด
    if (e.target === candleModal) {
      candleModal.classList.remove("active");
      // รีเซ็ตข้อมูล (Optional)
      userData = { character: "", name: "", flower: "", wish: "", temple: "" };
      console.log("🔒 ปิด Modal จากการคลิกพื้นที่ว่าง");
    }
  });
  let userData = { character: "", name: "", flower: "", wish: "", temple: "" };
  let timerInterval;
  const ROUND_TIME = 10;
  const TOTAL_TIME = 30;
  let timeLeft = TOTAL_TIME;

  const characterFlowerWalkImages = {
    monk1: { "ดอกไม้ขาว": "img/male1_flower1.gif", "ดอกไม้ชมพู": "img/male1_flower2.gif", "ดอกดาวเรือง": "img/male1_flower3.gif", "ดอกบัว": "img/male1_flower4.gif" },
    monk2: { "ดอกไม้ขาว": "img/male2_flower1.gif", "ดอกไม้ชมพู": "img/male2_flower2.gif", "ดอกดาวเรือง": "img/male2_flower3.gif", "ดอกบัว": "img/male2_flower4.gif" },
    nun1: { "ดอกไม้ขาว": "img/female1_flower1.gif", "ดอกไม้ชมพู": "img/female1_flower2.gif", "ดอกดาวเรือง": "img/female1_flower3.gif", "ดอกบัว": "img/female1_flower4.gif" },
    nun2: { "ดอกไม้ขาว": "img/female2_flower1.gif", "ดอกไม้ชมพู": "img/female2_flower2.gif", "ดอกดาวเรือง": "img/female2_flower3.gif", "ดอกบัว": "img/female2_flower4.gif" }
  };
  const characterImages = { monk1: "img/male1.png", monk2: "img/male2.png", nun1: "img/female1.png", nun2: "img/female2.png" };
  const templeImages = { "วัดบัวขวัญ": "img/temple1.png", "วัดกู้": "img/temple3.png", "วัดสะพานสูง": "img/temple3.png", "วัดปราสาท": "img/temple4.png" };

  function showStep(stepNumber) {
    document.querySelectorAll(".modal-step").forEach(s => s.classList.remove("active"));
    document.querySelector(`.step-${stepNumber}`)?.classList.add("active");

    // ควบคุมการเลื่อนใน Modal: หน้า Step 6 ไม่ให้มีสโครลขึ้น‑ลง
    const candleModal = document.querySelector(".candle-modal");
    if (candleModal) {
      if (stepNumber === 6) {
        candleModal.classList.add("no-scroll");
      } else {
        candleModal.classList.remove("no-scroll");
      }
    }
  }

  function startCandleAnimation() {
    const resultCharacter = document.getElementById("resultCharacter");
    const characterPrayer = document.getElementById("characterPrayer");
    const templeBackground = document.getElementById("templeBackground");
    const walkingCharContainer = document.getElementById("walkingCharacter");

    if (resultCharacter) resultCharacter.src = characterFlowerWalkImages[userData.character]?.[userData.flower] || characterImages[userData.character];
    if (characterPrayer) characterPrayer.textContent = `${userData.name} : ${userData.wish}`;
    
    // ✅ จุดแก้ไข: แสดงพื้นหลังวัดหน้าเวียนเทียน
    if (templeBackground) {
        templeBackground.style.backgroundImage = `url("${templeImages[userData.temple]}")`;
        templeBackground.style.opacity = "1";
    }

    if (walkingCharContainer) {
      walkingCharContainer.style.animation = "none";
      void walkingCharContainer.offsetWidth; 
      walkingCharContainer.style.animation = "walkAcross 12s linear infinite";
    }

    document.getElementById("prayerTicker")?.classList.add("prayer-ticker--active");
    startTimer();
  }

  function startTimer() {
    timeLeft = TOTAL_TIME;
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById("timerSeconds").textContent = timeLeft;
      document.getElementById("roundNumber").textContent = Math.floor((TOTAL_TIME - timeLeft) / ROUND_TIME) + 1;
      const progress = (TOTAL_TIME - timeLeft) / TOTAL_TIME;
      const timerCircle = document.getElementById("timerCircle");
      if (timerCircle) timerCircle.style.strokeDashoffset = 283 * (1 - progress);
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showStep(6);
        showFinalResult();
        saveParticipantToFirestore(); // ✅ บันทึกข้อมูลเมื่อเวียนเทียนครบ
      }
    }, 1000);
  }

 // --- 3. ฟังก์ชัน Database & Result ---
  
  function saveParticipantToFirestore() {
    const db = window.firebaseDb;
    // ตรวจสอบว่ามี db และชื่อผู้ใช้ก่อนบันทึก
    if (!db || !userData.name) {
        console.warn("ไม่สามารถบันทึกได้: ขาดข้อมูลผู้ใช้หรือการเชื่อมต่อ Firebase");
        return;
    }

    db.collection("wianTian").add({
      ...userData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("✅ บันทึกข้อมูลลง Firebase สำเร็จ");
        // หลังจากบันทึกสำเร็จ ให้ดึงข้อมูลเพื่อนใหม่ทันทีเพื่อให้หน้า 6 อัปเดต
        fetchFriends(); 
    })
    .catch(e => console.error("❌ บันทึกผิดพลาด:", e));
  }

  // --- 3. ฟังก์ชัน Database & Result ---

function saveParticipantToFirestore() {
  const db = window.firebaseDb;
  if (!db || !userData.name) return;

  db.collection("wianTian").add({
    ...userData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    console.log("✅ บันทึกข้อมูลลง Firebase สำเร็จ");
    // หลังจากบันทึกชื่อเราแล้ว ให้ดึงเพื่อนใหม่เพื่อให้อัปเดตข้อมูลล่าสุด
    fetchFriends(); 
  })
  .catch(e => console.error("❌ บันทึกผิดพลาด:", e));
}

function showFinalResult() {
  const db = window.firebaseDb;
  const finalWalkingCharacter = document.getElementById("finalWalkingCharacter"); 
  const finalCharacter = document.getElementById("finalCharacter");
  const finalWish = document.getElementById("finalWish");
  const finalTempleBg = document.getElementById("finalTempleBg");

  // แสดงรูปวัด
  if (finalTempleBg) {
    finalTempleBg.style.backgroundImage = `url("${templeImages[userData.temple]}")`;
    finalTempleBg.style.backgroundSize = "cover";
    finalTempleBg.style.backgroundPosition = "center";
    finalTempleBg.style.opacity = "0.8";
  }

  // ✅ ตั้งค่าตัวเรา: ใส่ชื่อ, คำอธิษฐาน และเพิ่ม Class 'is-me' เพื่อให้มีหางลูกโป่ง
  if (finalWish) finalWish.textContent = `${userData.name} : ${userData.wish}`;
  if (finalWalkingCharacter) {
    finalWalkingCharacter.classList.add("is-me");
    // ✅ ตัวเราออกเดินทันที
    finalWalkingCharacter.style.animation = "finalWalkAcross 18s linear infinite";
    finalWalkingCharacter.style.animationDelay = "0s";
  }
  
  
  if (finalCharacter) {
    finalCharacter.src = characterFlowerWalkImages[userData.character]?.[userData.flower] || characterImages[userData.character];
  }

  if (db) {
    db.collection("wianTian").onSnapshot(snap => {
      const countEl = document.getElementById("participantCount");
      if (countEl) countEl.textContent = snap.size;
    });
    fetchFriends();
  }
}

function fetchFriends() {
  const db = window.firebaseDb;
  const finalParticipantsWalkEl = document.getElementById("finalParticipantsWalk");
  if (!db || !finalParticipantsWalkEl) return;

  finalParticipantsWalkEl.innerHTML = "";
  
  db.collection("wianTian")
    .where("temple", "==", userData.temple)
    .orderBy("createdAt", "desc")
    .limit(15)
    .get()
    .then(snap => {
      let list = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.name !== userData.name) list.push(data);
      });

      const shuffled = list.sort(() => Math.random() - 0.5).slice(0, 8);
      
     shuffled.forEach((p, i) => {
  const div = document.createElement("div");
  div.className = "final-participant-item";

  // ✅ ออกทีละตัว ห่างกันตัวละ 4 วิ (ตามหลังเรา 3 วิ)
  const delay = 3 + (i * 4);
  div.style.animation = "finalWalkAcross 18s linear infinite";
  div.style.animationDelay = `${delay}s`;

  // ✅ แบ่งเป็น 3 เลน ไม่ให้ยืนซ้อนกัน
  const laneIndex = i % 1;          // 0,1,2
  const baseBottom = 5;             // เลนล่างสุด
  const laneGap = 12;               // ระยะห่างแต่ละเลน (px)
  const bottomPx = baseBottom + laneIndex * laneGap;
  div.style.bottom = `${bottomPx}px`;

  const charImg = characterFlowerWalkImages[p.character]?.[p.flower] || characterImages[p.character];
  div.innerHTML = `
    <div class="final-participant-prayer">${p.name} : ${p.wish.slice(0, 40)}</div>
    <img class="avatar" src="${charImg}" />
  `;
  finalParticipantsWalkEl.appendChild(div);
});
      });
}


  // --- ส่วนจัดการ Event ปุ่มต่างๆ ---
  document.getElementById("startOnlineCandleBtn")?.addEventListener("click", () => {
    document.getElementById("candleModal").classList.add("active");
    showStep(1);
  });

  document.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".character-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      userData.character = card.getAttribute("data-character");
      document.getElementById("nextToFlower").disabled = !(userData.character && userData.name);
    });
  });

  document.getElementById("userName")?.addEventListener("input", (e) => {
    userData.name = e.target.value.trim();
    document.getElementById("nextToFlower").disabled = !(userData.character && userData.name);
  });

  document.getElementById("nextToFlower")?.addEventListener("click", () => showStep(3));
  document.getElementById("nextToTemple")?.addEventListener("click", () => showStep(4));
  
  document.querySelectorAll(".flower-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".flower-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      userData.flower = card.getAttribute("data-flower");
      document.getElementById("nextToTemple").disabled = !(userData.flower && userData.wish);
    });
  });

  document.getElementById("userWish")?.addEventListener("input", (e) => {
    userData.wish = e.target.value.trim();
    document.getElementById("nextToTemple").disabled = !(userData.flower && userData.wish);
  });

  document.querySelectorAll(".temple-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".temple-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      userData.temple = card.getAttribute("data-temple");
      document.getElementById("nextToResult").disabled = false;
    });
  });

  document.getElementById("nextToResult")?.addEventListener("click", () => {
    if (userData.temple) { showStep(5); startCandleAnimation(); }
  });
// ✅ ปุ่มข้ามไปหน้าสรุป
  document.getElementById("skipToEnd")?.addEventListener("click", () => {
    if (timerInterval) clearInterval(timerInterval);
    saveParticipantToFirestore(); // บันทึกข้อมูลก่อนข้าม
    showStep(6);
    showFinalResult();
  });

  // ✅ แก้ไขปุ่มเริ่มต้นใหม่ (พาไปหน้าเลือกตัวละคร Step 1)
  document.getElementById("restartCandle")?.addEventListener("click", () => {
    // 1. ล้างสถานะขอบสีส้มที่เคยเลือกไว้
    document.querySelectorAll(".character-card, .flower-card, .temple-card").forEach(c => c.classList.remove("selected"));
    
    // 2. ล้าง class ที่ทำให้เกิดแถบขาวหน้าสุดท้าย
    const finalWalkingChar = document.getElementById("finalWalkingCharacter");
    if (finalWalkingChar) finalWalkingChar.classList.remove("is-me");
    if (candleModal) candleModal.classList.remove("no-scroll");

    // 3. รีเซ็ตค่า userData (เอาชื่อเก็บไว้ หรือล้างออกก็ได้)
    userData.flower = "";
    userData.wish = "";
    userData.temple = "";

    // 4. กลับไปหน้า Step 1 ทันทีโดยไม่รีโหลดเว็บ
    showStep(1); 
  });

  // ✅ ปุ่มปิด Modal
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("candleModal").classList.remove("active");
    if (candleModal) candleModal.classList.remove("no-scroll");
  });

}); // ปีกกาปิดของ DOMContentLoaded

// ✅ ปุ่มในหน้าเว็บหลักให้เลื่อนลงมาที่กิจกรรม
document.getElementById("startCandleBtn")?.addEventListener("click", () => {
  document.getElementById("candle")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
  
// ปุ่มใน Hero ให้เลื่อนไป section กิจกรรม
document.getElementById("startCandleBtn")?.addEventListener("click", () => {
  const candleSection = document.getElementById("candle");

  candleSection?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});