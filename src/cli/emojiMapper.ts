// Map keywords to emojis for task titles
const emojiMap: Array<{ keywords: string[]; emoji: string }> = [
  // Travel
  { keywords: ['viaje', 'viajar', 'travel', 'trip'], emoji: '✈️' },
  { keywords: ['vuelo', 'vuelos', 'flight', 'tiquete', 'tiquetes', 'ticket'], emoji: '✈️' },
  { keywords: ['hotel', 'hoteles', 'alojamiento', 'reservar'], emoji: '🏨' },
  { keywords: ['itinerario', 'itinerary', 'ruta'], emoji: '🗺️' },
  { keywords: ['visa', 'visado', 'documentos', 'documentos de viaje'], emoji: '🛂' },
  { keywords: ['seguro', 'insurance', 'seguro de viaje'], emoji: '🛡️' },
  { keywords: ['presupuesto', 'budget', 'dinero', 'costo'], emoji: '💰' },
  
  // Shopping
  { keywords: ['comprar', 'buy', 'purchase', 'adquirir'], emoji: '🛒' },
  { keywords: ['tienda', 'shop', 'tienda online'], emoji: '🏪' },
  
  // Food
  { keywords: ['comida', 'food', 'restaurante', 'restaurant'], emoji: '🍽️' },
  { keywords: ['cocinar', 'cook', 'receta'], emoji: '👨‍🍳' },
  
  // Work
  { keywords: ['trabajo', 'work', 'proyecto', 'project'], emoji: '💼' },
  { keywords: ['reunión', 'meeting', 'junta'], emoji: '🤝' },
  { keywords: ['presentación', 'presentation', 'exposición'], emoji: '📊' },
  
  // Learning
  { keywords: ['estudiar', 'study', 'curso', 'course', 'aprender'], emoji: '📚' },
  { keywords: ['examen', 'exam', 'test', 'prueba'], emoji: '📝' },
  
  // Home
  { keywords: ['casa', 'home', 'limpieza', 'clean'], emoji: '🏠' },
  { keywords: ['reparar', 'fix', 'arreglar'], emoji: '🔧' },
  
  // Health
  { keywords: ['salud', 'health', 'médico', 'doctor'], emoji: '🏥' },
  { keywords: ['ejercicio', 'exercise', 'gym', 'entrenar'], emoji: '💪' },
  
  // Technology
  { keywords: ['código', 'code', 'programar', 'programming'], emoji: '💻' },
  { keywords: ['app', 'aplicación', 'application'], emoji: '📱' },
  { keywords: ['instalar', 'install', 'configurar', 'setup'], emoji: '⚙️' },
  
  // Communication
  { keywords: ['email', 'correo', 'mensaje', 'message'], emoji: '📧' },
  { keywords: ['llamar', 'call', 'teléfono', 'phone'], emoji: '📞' },
  
  // Finance
  { keywords: ['pagar', 'pay', 'factura', 'bill'], emoji: '💳' },
  { keywords: ['banco', 'bank', 'cuenta', 'account'], emoji: '🏦' },
  
  // Events
  { keywords: ['evento', 'event', 'fiesta', 'party'], emoji: '🎉' },
  { keywords: ['cumpleaños', 'birthday'], emoji: '🎂' },
  
  // Default/Organization
  { keywords: ['organizar', 'organize', 'planificar', 'plan'], emoji: '🗂️' },
  { keywords: ['tarea', 'task'], emoji: '📋' },
  { keywords: ['lista', 'list'], emoji: '📝' },
];

/**
 * Get emoji for a task title based on keywords
 */
export function getEmojiForTask(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  // Check each emoji map entry
  for (const { keywords, emoji } of emojiMap) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return emoji;
    }
  }
  
  // Default emoji if no match
  return '📌';
}

