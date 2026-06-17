<template>
  <div class="error-container">
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="error-content">
      <div class="error-animation">
        <div class="error-number">
          <span class="digit">4</span>
          <span class="digit-middle">
            <q-icon name="error_outline" class="error-icon" />
          </span>
          <span class="digit">4</span>
        </div>
      </div>
      
      <h1 class="error-title">Page Not Found</h1>
      <p class="error-message">The page you're looking for doesn't exist or you don't have access to it.</p>
      
      <div class="error-actions">
        <q-btn
          unelevated
          to="/"
          label="Back to Home"
          icon="home"
          class="home-btn"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Error404'
})
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #003399 0%, #0055cc 50%, #00b2e3 100%);
  position: relative;
  overflow: hidden;
}

.error-content {
  text-align: center;
  z-index: 100;
  position: relative;
}

.error-animation {
  margin-bottom: 2rem;
}

.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.digit {
  font-size: 10rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  animation: bounce 2s ease-in-out infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
}

.digit:nth-child(3) {
  animation-delay: 0.2s;
}

.digit-middle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  font-size: 8rem;
  color: white;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
}

.error-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.02em;
}

.error-message {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  max-width: 500px;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.home-btn {
  background: white;
  color: #003399;
  border-radius: 50px;
  padding: 12px 40px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation: float 20s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  right: 15%;
  animation: float 15s ease-in-out infinite;
  animation-delay: -5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation: float 25s ease-in-out infinite;
  animation-delay: -10s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -30px); }
  66% { transform: translate(-20px, 20px); }
}

@media (max-width: 768px) {
  .digit {
    font-size: 6rem;
  }
  
  .error-icon {
    font-size: 5rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-message {
    font-size: 1rem;
    padding: 0 1rem;
  }
}
</style>
