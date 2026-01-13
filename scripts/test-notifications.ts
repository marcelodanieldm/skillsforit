// Script de prueba para el sistema de notificaciones
// Ejecutar con: npx tsx scripts/test-notifications.ts

import { scheduleSessionReminder, startNotificationProcessor } from '../lib/notifications'
import { sendSessionReminderNotification } from '../lib/notifications'

// Simular la programación de un recordatorio
console.log('🧪 Probando sistema de notificaciones...\n')

// 1. Probar programación de recordatorio
const testSessionId = 'test-session-123'
const reminderTime = new Date(Date.now() + 2 * 60 * 1000) // 2 minutos en el futuro

console.log('1. Programando recordatorio para sesión de prueba...')
scheduleSessionReminder(testSessionId, reminderTime)
console.log(`   ✅ Recordatorio programado para: ${reminderTime.toISOString()}\n`)

// 2. Iniciar procesador de notificaciones
console.log('2. Iniciando procesador de notificaciones...')
startNotificationProcessor()
console.log('   ✅ Procesador iniciado\n')

// 3. Esperar a que se procese el recordatorio
console.log('3. Esperando procesamiento del recordatorio...')
setTimeout(() => {
  console.log('   ⏰ Verificando si el recordatorio fue procesado...\n')

  // 4. Probar envío directo de notificación (para verificar templates)
  console.log('4. Probando envío directo de notificación de recordatorio...')
  sendSessionReminderNotification(testSessionId).then(result => {
    if (result.success) {
      console.log('   ✅ Notificación enviada exitosamente')
    } else {
      console.log('   ❌ Error enviando notificación:', result.error)
    }
    console.log('\n🎉 Prueba completada!')
    process.exit(0)
  }).catch(error => {
    console.log('   ❌ Error en prueba:', error.message)
    process.exit(1)
  })

}, 3 * 60 * 1000) // Esperar 3 minutos

console.log('   Esperando 3 minutos para que se procese el recordatorio...\n')