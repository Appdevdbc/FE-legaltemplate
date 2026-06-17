<template>
  <q-page class="welcome-screen">
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="content-container">
      <div class="welcome-card">
        <div class="icon-container">
          <div class="icon-glow"></div>
          <div class="icon-wrapper">
            <q-icon name="design_services" class="main-icon" />
          </div>
          <div class="floating-particles">
            <span class="particle" v-for="i in 6" :key="i"></span>
          </div>
        </div>
        
        <div class="text-content">
          <h1 class="main-title">{{ nama() }}</h1>
          <p class="subtitle">Selamat Datang<br/>di Aplikasi Legal Template Folder</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { empid, nama, nik, ParseError, domain,unit,idleTime, spinnerBall, role, decryptMessage } from "../utils";
</script>
<style scoped>
.welcome-screen {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #fefce8 100%);
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  animation: float-orb 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  top: -20%;
  left: -10%;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
  bottom: -20%;
  right: -10%;
  animation-delay: 7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

.content-container {
  position: relative;
  z-index: 10;
  padding: 2rem;
}

.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon-container {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  opacity: 0.15;
  filter: blur(40px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.2); opacity: 0.25; }
}

.icon-wrapper {
  position: relative;
  background: white;
  border: 2px solid rgba(220, 38, 38, 0.1);
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(220, 38, 38, 0.15);
  animation: float-icon 4s ease-in-out infinite;
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

.main-icon {
  font-size: 4.5rem;
  color: #dc2626;
  filter: drop-shadow(0 4px 12px rgba(220, 38, 38, 0.2));
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border-radius: 50%;
  opacity: 0.4;
  animation: float-particle 3s ease-in-out infinite;
}

.particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 80%; left: 10%; animation-delay: 0.5s; }
.particle:nth-child(3) { top: 20%; right: 15%; animation-delay: 1s; }
.particle:nth-child(4) { bottom: 15%; right: 20%; animation-delay: 1.5s; }
.particle:nth-child(5) { top: 50%; left: 5%; animation-delay: 2s; }
.particle:nth-child(6) { bottom: 30%; right: 5%; animation-delay: 2.5s; }

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
}

.text-content {
  text-align: center;
  max-width: 600px;
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(220, 38, 38, 0.15));
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: drop-shadow(0 2px 8px rgba(220, 38, 38, 0.15)); }
  50% { filter: drop-shadow(0 4px 12px rgba(220, 38, 38, 0.25)); }
}

.subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .main-title { font-size: 2rem; }
  .subtitle { font-size: 1rem; }
  .icon-wrapper { width: 100px; height: 100px; }
  .main-icon { font-size: 3.5rem; }
  .icon-container { width: 140px; height: 140px; }
}
</style>